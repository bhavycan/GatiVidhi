const { adminModel } = require("../models/adminModel");
const { taskListModel } = require("../models/taskListModel");
const { projectModel } = require("../models/projectModel");
const { updateModel } = require("../models/updateModel");
const { commentModel } = require("../models/commentModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


module.exports.adminLogInController = async (req, res) => {
  const { email, password } = req.body;
  console.log(`[ADMIN LOGIN] Attempt - email: ${email}, origin: ${req.headers.origin}, ip: ${req.ip}`);
  if (!email | !password) {
    console.log(`[ADMIN LOGIN] Failed - missing email or password`);
    return res.status(400).send("Email and password not available");
  }

  try {
    let admin = await adminModel.findOne({ email });
    if (!admin) {
      console.log(`[ADMIN LOGIN] Failed - admin not found: ${email}`);
      return res.status(400).send("Admin does not exist");
    }
    const check = await bcrypt.compare(password, admin.password);
    if (!check) {
      console.log(`[ADMIN LOGIN] Failed - wrong password for: ${email}`);
      return res.status(400).send("Wrong Password");
    }
    const token = jwt.sign({ email: email }, process.env.ADMIN_JWT_SECRET);
    res.cookie("admintoken", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });
    console.log(`[ADMIN LOGIN] Success - ${email}`);
    res.status(200).send("Admin Login Succesful");
  } catch (error) {
    console.error(`[ADMIN LOGIN] Error:`, error);
    res.status(500).send("Something went wrong");
  }
}

module.exports.adminLogOutController = async(req,res)=>{
    try {
            const {id} = req.body;
            let admin = await adminModel.findOne({_id : id});
            if(!admin) return res.status(400).send("Inavlid Id");
            res.cookie("admintoken", "")
            res.status(200).send("Logged Out succesfully")
        } catch (error) {
            console.error(error);
            res.status(500).send("Something wend wrong!")
        }
}

module.exports.adminNotificationsController = async (req, res) => {
  try {
    const now = new Date();
    const twoDaysAgo = new Date(now - 2 * 24 * 60 * 60 * 1000);
    const notifications = [];

    // 1. Overdue tasks — date is set, date <= now, status !== 'completed'
    const taskLists = await taskListModel
      .find()
      .populate('projectId', 'projectName status');

    taskLists.forEach(list => {
      if (!list.projectId || list.projectId.status !== 'ongoing') return;
      list.tasks.forEach(task => {
        if (task.date && new Date(task.date) <= now && task.status !== 'completed') {
          notifications.push({
            type: 'task',
            message: `"${task.name}" is overdue`,
            projectName: list.projectId.projectName,
            projectId: list.projectId._id,
            date: task.date,
          });
        }
      });
    });

    // 2. Ongoing projects with no update in the last 2 days
    const ongoingProjects = await projectModel
      .find({ status: 'ongoing' })
      .select('_id projectName');

    for (const project of ongoingProjects) {
      const recentUpdate = await updateModel.findOne({
        projectId: project._id,
        createdAt: { $gte: twoDaysAgo },
      });
      if (!recentUpdate) {
        notifications.push({
          type: 'update',
          message: 'No update posted in the last 2 days',
          projectName: project.projectName,
          projectId: project._id,
        });
      }
    }

    // 3. Unresolved tickets
    const openTickets = await commentModel
      .find({ resolved: false })
      .populate('projectId', 'projectName')
      .sort({ receivedDate: -1 });

    openTickets.forEach(t => {
      notifications.push({
        type: 'ticket',
        message: t.note.length > 60 ? t.note.slice(0, 60) + '…' : t.note,
        projectName: t.projectId?.projectName || 'Unknown',
        projectId: t.projectId?._id,
        ticketId: t._id,
        priority: t.priorityLevel,
        date: t.receivedDate,
      });
    });

    return res.status(200).json({ notifications, count: notifications.length });
  } catch (err) {
    console.error(err);
    res.status(500).send('Something went wrong');
  }
};
