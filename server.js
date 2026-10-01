const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'projects.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function readProjects() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [
      {
        id: 'proj-1001',
        title: 'Launch Dashboard',
        owner: 'Aisha',
        status: 'In Progress',
        priority: 'High',
        budget: 2400,
        progress: 72,
        description: 'Core monitoring analytics for the customer portal.'
      },
      {
        id: 'proj-1002',
        title: 'Client Portal',
        owner: 'Rahul',
        status: 'Planning',
        priority: 'Medium',
        budget: 1800,
        progress: 30,
        description: 'User-facing portal for subscriptions and account activity.'
      },
      {
        id: 'proj-1003',
        title: 'API Reliability',
        owner: 'Nina',
        status: 'Completed',
        priority: 'High',
        budget: 3100,
        progress: 100,
        description: 'Performance monitoring and endpoint reliability improvements.'
      }
    ];
  }
}

function writeProjects(projects) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(projects, null, 2));
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Full Stack Project 2 backend is running.' });
});

app.get('/api/projects', (req, res) => {
  const projects = readProjects();
  res.json(projects);
});

app.get('/api/projects/:id', (req, res) => {
  const { id } = req.params;
  const projects = readProjects();
  const project = projects.find((item) => item.id === id);

  if (!project) {
    return res.status(404).json({ message: 'Project not found.' });
  }

  res.json(project);
});

app.post('/api/projects', (req, res) => {
  const { title, owner, status, priority, budget, progress, description } = req.body;

  if (!title || !owner) {
    return res.status(400).json({ message: 'Title and owner are required.' });
  }

  const projects = readProjects();
  const newProject = {
    id: `proj-${Date.now()}`,
    title: title.trim(),
    owner: owner.trim(),
    status: status || 'Planning',
    priority: priority || 'Medium',
    budget: Number(budget) || 0,
    progress: Number(progress) || 0,
    description: description ? description.trim() : 'New project created.'
  };

  projects.unshift(newProject);
  writeProjects(projects);
  res.status(201).json(newProject);
});

app.put('/api/projects/:id', (req, res) => {
  const { id } = req.params;
  const projects = readProjects();
  const projectIndex = projects.findIndex((project) => project.id === id);

  if (projectIndex === -1) {
    return res.status(404).json({ message: 'Project not found.' });
  }

  const updatedProject = {
    ...projects[projectIndex],
    ...req.body,
    id,
    budget: Number(req.body.budget ?? projects[projectIndex].budget) || 0,
    progress: Number(req.body.progress ?? projects[projectIndex].progress) || 0
  };

  projects[projectIndex] = updatedProject;
  writeProjects(projects);
  res.json(updatedProject);
});

app.delete('/api/projects/:id', (req, res) => {
  const { id } = req.params;
  const projects = readProjects();
  const filtered = projects.filter((project) => project.id !== id);

  if (filtered.length === projects.length) {
    return res.status(404).json({ message: 'Project not found.' });
  }

  writeProjects(filtered);
  res.json({ message: 'Project deleted successfully.' });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Project 2 server running at http://localhost:${PORT}`);
});
