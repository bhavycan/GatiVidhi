const { noteModel } = require('../models/noteModel');

module.exports.noteGetAllController = async (req, res) => {
  try {
    const notes = await noteModel.find().sort({ createdAt: -1 }).lean();
    res.status(200).json(notes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

module.exports.noteCreateController = async (req, res) => {
  const { title, body } = req.body;
  if (!title?.trim()) return res.status(400).json({ message: 'Title is required' });

  try {
    const note = await noteModel.create({ title: title.trim(), body: body?.trim() || '' });
    res.status(201).json(note);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

module.exports.noteToggleController = async (req, res) => {
  const { id } = req.body;
  if (!id) return res.status(400).json({ message: 'id is required' });

  try {
    const note = await noteModel.findById(id);
    if (!note) return res.status(404).json({ message: 'Note not found' });
    note.done = !note.done;
    await note.save();
    res.status(200).json(note);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

module.exports.noteDeleteController = async (req, res) => {
  const { id } = req.body;
  if (!id) return res.status(400).json({ message: 'id is required' });

  try {
    const note = await noteModel.findByIdAndDelete(id);
    if (!note) return res.status(404).json({ message: 'Note not found' });
    res.status(200).json({ message: 'Note deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};
