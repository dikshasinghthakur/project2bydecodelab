const projectList = document.getElementById('project-list');
const form = document.getElementById('project-form');
const formMessage = document.getElementById('form-message');
const statusBadge = document.getElementById('api-status');
const totalProjects = document.getElementById('total-projects');
const inProgressCount = document.getElementById('in-progress');
const completedProjects = document.getElementById('completed-projects');
const totalBudget = document.getElementById('total-budget');
const projectCountBadge = document.getElementById('project-count-badge');
const projectSearch = document.getElementById('project-search');
const statusFilter = document.getElementById('status-filter');
const priorityFilter = document.getElementById('priority-filter');
const clearFiltersButton = document.getElementById('clear-filters');
const averageProgress = document.getElementById('average-progress');
const portfolioProgressFill = document.getElementById('portfolio-progress-fill');
const statusMixTotal = document.getElementById('status-mix-total');
const statusStack = document.querySelector('.status-stack');
const planningSegment = document.getElementById('planning-segment');
const progressSegment = document.getElementById('progress-segment');
const completedSegment = document.getElementById('completed-segment');
const planningCount = document.getElementById('planning-count');
const progressCount = document.getElementById('progress-count');
const completedCount = document.getElementById('completed-count');
let allProjects = [];

function showFormMessage(message, type = 'success') {
  if (!formMessage) return;
  formMessage.textContent = message;
  formMessage.className = `form-message ${type}`;
}

async function checkApi() {
  try {
    const response = await fetch('/api/health');
    if (!response.ok) throw new Error('API unavailable');
    statusBadge.textContent = 'API connected';
    statusBadge.style.color = '#dffaf2';
    return true;
  } catch (error) {
    statusBadge.textContent = 'API offline';
    statusBadge.style.color = '#ffd7d7';
    return false;
  }
}

function getPriorityClass(priority) {
  if (priority === 'High') return 'warning';
  if (priority === 'Completed') return 'success';
  return '';
}

function updatePortfolioPulse() {
  const total = allProjects.length;
  const counts = {
    planning: allProjects.filter((project) => project.status === 'Planning').length,
    inProgress: allProjects.filter((project) => project.status === 'In Progress').length,
    completed: allProjects.filter((project) => project.status === 'Completed').length
  };
  const average = total
    ? Math.round(allProjects.reduce((sum, project) => sum + Number(project.progress || 0), 0) / total)
    : 0;

  averageProgress.textContent = `${average}%`;
  portfolioProgressFill.style.width = `${Math.min(100, average)}%`;
  statusMixTotal.textContent = `${total} ${total === 1 ? 'project' : 'projects'}`;
  planningCount.textContent = String(counts.planning);
  progressCount.textContent = String(counts.inProgress);
  completedCount.textContent = String(counts.completed);
  planningSegment.style.width = `${total ? (counts.planning / total) * 100 : 0}%`;
  progressSegment.style.width = `${total ? (counts.inProgress / total) * 100 : 0}%`;
  completedSegment.style.width = `${total ? (counts.completed / total) * 100 : 0}%`;
  statusStack.setAttribute(
    'aria-label',
    `Planning ${counts.planning}, in progress ${counts.inProgress}, completed ${counts.completed}`
  );
}

function renderProjects(projects) {
  updatePortfolioPulse();
  const inProgress = allProjects.filter((project) => project.status === 'In Progress').length;
  const completed = allProjects.filter((project) => project.status === 'Completed').length;
  const budgetTotal = allProjects.reduce((sum, project) => sum + Number(project.budget || 0), 0);

  totalProjects.textContent = String(allProjects.length);
  inProgressCount.textContent = String(inProgress);
  completedProjects.textContent = String(completed);
  totalBudget.textContent = `$${budgetTotal.toLocaleString()}`;
  projectCountBadge.textContent = projects.length === allProjects.length
    ? `${allProjects.length} items`
    : `${projects.length} of ${allProjects.length} projects`;

  if (!allProjects.length) {
    projectList.innerHTML = '<p class="empty-state">No projects yet. Create one from the form.</p>';
    return;
  }

  if (!projects.length) {
    projectList.innerHTML = '<p class="empty-state">No projects match these filters.</p>';
    return;
  }

  projectList.innerHTML = projects
    .map((project) => {
      const badgeClass = project.priority === 'High' ? 'warning' : project.priority === 'Low' ? '' : '';
      const statusClass = project.status === 'Completed' ? 'success' : project.status === 'In Progress' ? 'warning' : '';

      return `
        <article class="project-card">
          <div class="card-top">
            <div>
              <h4>${project.title}</h4>
              <div class="project-meta">
                <span>Owner: ${project.owner}</span>
                <span>•</span>
                <span>${project.description || 'No description provided.'}</span>
              </div>
            </div>
            <div class="badge ${statusClass}">${project.status}</div>
          </div>

          <div class="card-body">
            <div class="progress-wrap">
              <div class="project-meta">
                <span class="badge ${badgeClass}">${project.priority} Priority</span>
                <span>Budget: $${Number(project.budget || 0).toLocaleString()}</span>
              </div>
              <div class="progress-line">
                <div class="progress-fill" style="width: ${Math.min(100, Number(project.progress || 0))}%;"></div>
              </div>
            </div>
            <div class="project-meta">
              <strong>${Math.min(100, Number(project.progress || 0))}%</strong>
            </div>
          </div>

          <div class="card-actions">
            <button class="action-btn primary" data-action="advance" data-id="${project.id}">Advance</button>
            <button class="action-btn danger" data-action="delete" data-id="${project.id}">Delete</button>
          </div>
        </article>
      `;
    })
    .join('');
}

function applyFilters() {
  const query = projectSearch.value.trim().toLowerCase();
  const selectedStatus = statusFilter.value;
  const selectedPriority = priorityFilter.value;
  const filteredProjects = allProjects.filter((project) => {
    const searchableText = `${project.title} ${project.owner} ${project.description || ''}`.toLowerCase();
    return searchableText.includes(query)
      && (!selectedStatus || project.status === selectedStatus)
      && (!selectedPriority || project.priority === selectedPriority);
  });

  renderProjects(filteredProjects);
}

async function fetchProjects() {
  try {
    const response = await fetch('/api/projects');
    if (!response.ok) throw new Error('Unable to load projects');
    allProjects = await response.json();
    applyFilters();
  } catch (error) {
    projectList.innerHTML = '<p class="empty-state">Unable to load project data.</p>';
  }
}

async function createProject(event) {
  event.preventDefault();
  const formData = new FormData(form);
  const payload = Object.fromEntries(formData.entries());

  try {
    const response = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error('Failed to add project');
    }

    form.reset();
    showFormMessage('Project created successfully!');
    fetchProjects();
  } catch (error) {
    showFormMessage('Your project could not be saved. Please try again.', 'error');
  }
}

async function updateProjectStatus(id) {
  try {
    const response = await fetch(`/api/projects/${id}`);
    if (!response.ok) throw new Error('Project not found');

    const project = await response.json();
    const currentStatus = project.status;
    const nextStatus = currentStatus === 'Planning' ? 'In Progress' : currentStatus === 'In Progress' ? 'Completed' : 'Planning';

    const updateResponse = await fetch(`/api/projects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...project, status: nextStatus, progress: nextStatus === 'Completed' ? 100 : nextStatus === 'In Progress' ? 60 : 25 })
    });

    if (!updateResponse.ok) throw new Error('Could not update project status');
    fetchProjects();
  } catch (error) {
    alert('Unable to update the project state.');
  }
}

async function deleteProject(id) {
  try {
    const response = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Could not delete project');
    fetchProjects();
  } catch (error) {
    alert('Unable to delete the project.');
  }
}

projectList.addEventListener('click', async (event) => {
  const target = event.target.closest('button');
  if (!target) return;

  const { action, id } = target.dataset;
  if (action === 'advance') {
    updateProjectStatus(id);
  }

  if (action === 'delete') {
    deleteProject(id);
  }
});

projectSearch.addEventListener('input', applyFilters);
statusFilter.addEventListener('change', applyFilters);
priorityFilter.addEventListener('change', applyFilters);
clearFiltersButton.addEventListener('click', () => {
  projectSearch.value = '';
  statusFilter.value = '';
  priorityFilter.value = '';
  applyFilters();
});

form.addEventListener('submit', createProject);

(async function init() {
  await checkApi();
  fetchProjects();
})();
