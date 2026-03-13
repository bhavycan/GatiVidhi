const { templateModel } = require('../models/templateModel');

const DEFAULT_TEMPLATES = [
  {
    _id: 'default_home',
    name: 'Full Home Interior',
    type: 'home',
    isDefault: true,
    tasks: [
      { name: 'Client requirement meeting' },
      { name: 'Site visit & measurements' },
      { name: 'Concept design planning' },
      { name: '2D layout design' },
      { name: '3D visualization presentation' },
      { name: 'Design revisions' },
      { name: 'Final design approval' },
      { name: 'Budget estimation' },
      { name: 'Contract signing' },
      { name: 'Material selection' },
      { name: 'Electrical planning' },
      { name: 'False ceiling planning' },
      { name: 'Furniture layout planning' },
      { name: 'Work schedule planning' },
      { name: 'Civil modifications' },
      { name: 'Electrical wiring work' },
      { name: 'False ceiling installation' },
      { name: 'Wall preparation & primer' },
      { name: 'Furniture production' },
      { name: 'Furniture installation' },
      { name: 'Painting & polishing' },
      { name: 'Decorative elements installation' },
      { name: 'Lighting installation' },
      { name: 'Appliance fitting' },
      { name: 'Cleaning & polishing' },
      { name: 'Quality inspection' },
      { name: 'Client walkthrough' },
      { name: 'Fix pending issues' },
      { name: 'Final handover' },
    ],
  },
  {
    _id: 'default_office',
    name: 'Office Interior',
    type: 'office',
    isDefault: true,
    tasks: [
      { name: 'Client requirement discussion' },
      { name: 'Office workflow analysis' },
      { name: 'Space planning' },
      { name: '2D layout' },
      { name: '3D office visualization' },
      { name: 'Budget approval' },
      { name: 'Civil modifications' },
      { name: 'Electrical & networking setup' },
      { name: 'False ceiling & lighting installation' },
      { name: 'Workstation furniture production' },
      { name: 'Cabin & meeting room setup' },
      { name: 'Storage & pantry installation' },
      { name: 'Wall paint / branding graphics' },
      { name: 'Lighting testing' },
      { name: 'Furniture placement' },
      { name: 'Final inspection' },
      { name: 'Client approval' },
      { name: 'Project handover' },
    ],
  },
  {
    _id: 'default_kitchen',
    name: 'Modular Kitchen',
    type: 'modular kitchen',
    isDefault: true,
    tasks: [
      { name: 'Kitchen measurement' },
      { name: 'Appliance requirement discussion' },
      { name: 'Work triangle planning' },
      { name: '2D kitchen layout' },
      { name: '3D kitchen design' },
      { name: 'Material selection' },
      { name: 'Budget estimation' },
      { name: 'Electrical & plumbing planning' },
      { name: 'Cabinet manufacturing planning' },
      { name: 'Plumbing adjustments' },
      { name: 'Electrical points installation' },
      { name: 'Cabinet manufacturing' },
      { name: 'Cabinet installation' },
      { name: 'Countertop installation' },
      { name: 'Chimney & appliance fitting' },
      { name: 'Hardware fitting' },
      { name: 'Cleaning & polishing' },
      { name: 'Quality inspection' },
      { name: 'Client demo' },
      { name: 'Final handover' },
    ],
  },
  {
    _id: 'default_furniture',
    name: 'Furniture Customization',
    type: 'furniture',
    isDefault: true,
    tasks: [
      { name: 'Requirement discussion' },
      { name: 'Space measurement' },
      { name: 'Furniture design' },
      { name: 'Material selection' },
      { name: 'Budget approval' },
      { name: 'Manufacturing' },
      { name: 'Polishing / laminating' },
      { name: 'Transportation' },
      { name: 'Furniture installation' },
      { name: 'Alignment & finishing' },
      { name: 'Quality check' },
      { name: 'Client approval' },
    ],
  },
  {
    _id: 'default_renovation',
    name: 'Renovation Project',
    type: 'renovation',
    isDefault: true,
    tasks: [
      { name: 'Site inspection' },
      { name: 'Damage assessment' },
      { name: 'Renovation planning' },
      { name: 'Layout redesign' },
      { name: '3D design' },
      { name: 'Budget approval' },
      { name: 'Demolition work' },
      { name: 'Civil repair work' },
      { name: 'Electrical & plumbing updates' },
      { name: 'Painting & finishing' },
      { name: 'Furniture installation' },
      { name: 'Lighting installation' },
      { name: 'Final cleaning' },
      { name: 'Client walkthrough' },
      { name: 'Handover' },
    ],
  },
  {
    _id: 'default_small',
    name: 'Small Interior Project',
    type: 'small',
    isDefault: true,
    tasks: [
      { name: 'Requirement discussion' },
      { name: 'Site measurement' },
      { name: 'Design proposal' },
      { name: 'Budget approval' },
      { name: 'Material purchase' },
      { name: 'Work execution' },
      { name: 'Installation' },
      { name: 'Cleaning' },
      { name: 'Final handover' },
    ],
  },
];

module.exports.templateGetAllController = async (req, res) => {
  try {
    const custom = await templateModel.find().lean();
    res.status(200).json({ templates: [...DEFAULT_TEMPLATES, ...custom] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

module.exports.templateCreateController = async (req, res) => {
  const { name, type, tasks } = req.body;
  if (!name || !type) return res.status(400).json({ message: 'name and type are required' });
  if (!Array.isArray(tasks) || tasks.length === 0) return res.status(400).json({ message: 'tasks must be a non-empty array' });

  try {
    const template = await templateModel.create({
      name,
      type,
      tasks: tasks.map(t => ({ name: t.name || t })),
      isDefault: false,
    });
    res.status(201).json(template);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

module.exports.templateUpdateController = async (req, res) => {
  const { id, name, type, tasks } = req.body;
  if (!id) return res.status(400).json({ message: 'id is required' });

  try {
    const template = await templateModel.findById(id);
    if (!template) return res.status(404).json({ message: 'Template not found' });
    if (template.isDefault) return res.status(403).json({ message: 'Cannot edit default templates' });

    if (name) template.name = name;
    if (type) template.type = type;
    if (Array.isArray(tasks)) template.tasks = tasks.map(t => ({ name: t.name || t }));
    await template.save();

    res.status(200).json(template);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

module.exports.templateDeleteController = async (req, res) => {
  const { id } = req.body;
  if (!id) return res.status(400).json({ message: 'id is required' });

  try {
    const template = await templateModel.findById(id);
    if (!template) return res.status(404).json({ message: 'Template not found' });
    if (template.isDefault) return res.status(403).json({ message: 'Cannot delete default templates' });

    await templateModel.findByIdAndDelete(id);
    res.status(200).json({ message: 'Template deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};
