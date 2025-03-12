import { useState, useEffect } from 'react';
import styles from './ProjectList.module.css';
import ProjectModal from '../ProjectModal';

const ProjectList = () => {
    const [projects, setProjects] = useState([]);
    const [filteredProjects, setFilteredProjects] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterOption, setFilterOption] = useState('projectName');
    const [selectedProject, setSelectedProject] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleFilterChange = (e) => {
        setFilterOption(e.target.value);
    };

    const handleProjectClick = async (project) => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem('token');
            
            const response = await fetch(`http://localhost:3000/analiseDeProjetos/projects/${project.id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
    
            if (!response.ok) {
                throw new Error('Falha ao carregar detalhes do projeto');
            }
    
            const projectDetails = await response.json();
            
            
            setSelectedProject(projectDetails);
            
            setTimeout(() => {
                setIsModalOpen(true);
                setIsEditing(false);
                setIsLoading(false);
            }, 50);
        } catch (error) {
            console.error("Erro ao carregar detalhes do projeto:", error);
            setIsLoading(false);
            alert(error.message);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedProject(null);
        setIsEditing(false);
    };

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleSaveProject = async (updatedProject) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:3000/analiseDeProjetos/projects/${updatedProject.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updatedProject)
            });
    
            if (!response.ok) {
                throw new Error('Falha ao atualizar o projeto');
            }
    
            // Fetch the updated project from the server to get the latest data
            const updatedResponse = await fetch(`http://localhost:3000/analiseDeProjetos/projects/${updatedProject.id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
    
            if (!updatedResponse.ok) {
                throw new Error('Falha ao obter o projeto atualizado');
            }
    
            const updatedProjectData = await updatedResponse.json();
            
            // Update the projects list with the fresh data from the server
            setProjects(projects.map(project =>
                project.id === updatedProjectData.id ? updatedProjectData : project));
            
            // Refresh the entire projects list to ensure all data is up to date
            fetchProjects();
            
            setIsModalOpen(false);
            setSelectedProject(null);
            setIsEditing(false);
        } catch (error) {
            console.error("Erro ao atualizar o projeto:", error);
            alert(error.message);
        }
    };

    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredProjects(projects);
        } else {
            const results = projects.filter(project => {
                const value = project[filterOption];
                return value && value.toLowerCase().includes(searchTerm.toLowerCase());
            });
            setFilteredProjects(results);
        }
    }, [searchTerm, filterOption, projects]);

    
    // Define fetchProjects outside useEffect so it can be called from anywhere in the component
    const fetchProjects = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:3000/analiseDeProjetos/projects', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Falha ao carregar projetos');
            }

            const data = await response.json();
            setProjects(data);
            setFilteredProjects(data);
        } catch (error) {
            console.error('Erro ao carregar projetos:', error);
        }
    };
    
    useEffect(() => {
        fetchProjects(); // Load projects when component mounts
    }, []);

    return (
        <div className={styles.projectList}>
            <div className={styles.searchContainer}>
                <input 
                    type="text" 
                    placeholder='Pesquisar projetos...'
                    value={searchTerm}
                    onChange={handleSearch}
                    className={styles.searchInput} 
                />
                <select 
                    value={filterOption}
                    onChange={handleFilterChange}
                    className={styles.filterSelect}
                >
                    <option value="projectName">Nome do Projeto</option>
                    <option value="developmentPhase">Fase de desenvolvimento</option>
                    <option value="responsibleFillingOut">Responsável</option>
                </select>
            </div>
            <h2>Lista de Projetos</h2>
            {isLoading ? (
                <p>Carregando...</p>
            ) : filteredProjects.length === 0 ? (
                <p>Nenhum projeto encontrado.</p>
            ) : (
                <ul className={styles.projectGrid}>
                    {filteredProjects.map(project => (
                        <li 
                            key={project.id}
                            className={styles.projectCard}
                            onClick={() => handleProjectClick(project)}
                        >
                            <h3>{project.projectName}</h3>
                            <p className={styles.description}>
                                {project.projectDescription}
                            </p>
                            <p className={styles.phase}>
                                Fase: {project.developmentPhase}
                            </p>
                            <p className={styles.responsible}>
                                Responsável: {project.responsibleFillingOut}
                            </p>
                        </li>
                    ))}
                </ul>
            )}
            {selectedProject && isModalOpen && (
                <ProjectModal 
                    isOpen={true}
                    isClose={handleCloseModal}
                    onSave={handleSaveProject}
                    project={selectedProject}
                    readOnly={!isEditing}
                    onEdit={handleEditClick}
                />
            )}
        </div>
    );
};

export default ProjectList;