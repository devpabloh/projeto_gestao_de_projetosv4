import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ProjectHistory.module.css';
import ProjectHistoryDetail from '../ProjectHistoryDetail';

const ProjectHistory = () => {
    const [historyItems, setHistoryItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedHistory, setSelectedHistory] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterOption, setFilterOption] = useState('all');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchHistoryData = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                
                if (!token) {
                    navigate('/');
                    return;
                }

                const response = await fetch('http://localhost:3000/analiseDeProjetos/history', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    if (response.status === 403) {
                        setError('Você não tem permissão para acessar o histórico de projetos.');
                    } else {
                        throw new Error('Falha ao carregar histórico de projetos');
                    }
                    return;
                }

                const data = await response.json();
                setHistoryItems(data);
                setError(null);
            } catch (error) {
                console.error('Erro ao carregar histórico:', error);
                setError('Erro ao carregar histórico de projetos. Por favor, tente novamente.');
            } finally {
                setLoading(false);
            }
        };

        fetchHistoryData();
    }, [navigate]);

    const handleHistoryItemClick = (historyItem) => {
        setSelectedHistory(historyItem);
        setIsDetailModalOpen(true);
    };

    const handleCloseDetailModal = () => {
        setIsDetailModalOpen(false);
        setSelectedHistory(null);
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleFilterChange = (e) => {
        setFilterOption(e.target.value);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getActionTypeLabel = (actionType) => {
        switch (actionType) {
            case 'create':
                return 'Criação';
            case 'update':
                return 'Atualização';
            case 'delete':
                return 'Exclusão';
            default:
                return actionType;
        }
    };

    const getActionTypeClass = (actionType) => {
        switch (actionType) {
            case 'create':
                return styles.create;
            case 'update':
                return styles.update;
            case 'delete':
                return styles.delete;
            default:
                return '';
        }
    };

    const filteredHistoryItems = historyItems.filter(item => {
        
        if (filterOption !== 'all' && item.actionType !== filterOption) {
            return false;
        }

        
        const searchLower = searchTerm.toLowerCase();
        return (
            item.projectName.toLowerCase().includes(searchLower) ||
            item.userName.toLowerCase().includes(searchLower) ||
            item.user?.name?.toLowerCase().includes(searchLower) ||
            String(item.projectId).includes(searchTerm) ||
            item.Project?.responsibleFillingOut.toLowerCase().includes(searchLower)
        );
    });

    return (
        <div className={styles.historyContainer}>
            <h2>Histórico de Alterações de Projetos</h2>
            
            {error && <div className={styles.error}>{error}</div>}
            
            <div className={styles.filterContainer}>
                <input
                    type="text"
                    placeholder="Pesquisar por nome, responsável ou ID..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className={styles.searchInput}
                />
                
                <select
                    value={filterOption}
                    onChange={handleFilterChange}
                    className={styles.filterSelect}
                >
                    <option value="all">Todas as ações</option>
                    <option value="create">Criação</option>
                    <option value="update">Atualização</option>
                    <option value="delete">Exclusão</option>
                </select>
            </div>
            
            {loading ? (
                <p className={styles.loading}>Carregando histórico...</p>
            ) : filteredHistoryItems.length === 0 ? (
                <p className={styles.noResults}>Nenhum registro de histórico encontrado.</p>
            ) : (
                <div className={styles.historyGrid}>
                    {filteredHistoryItems.map(item => (
                        <div 
                            key={item.id} 
                            className={`${styles.historyCard} ${getActionTypeClass(item.actionType)}`}
                            onClick={() => handleHistoryItemClick(item)}
                        >
                            <div className={styles.cardHeader}>
                                <span className={styles.actionType}>
                                    {getActionTypeLabel(item.actionType)}
                                </span>
                                <span className={styles.timestamp}>
                                    {formatDate(item.timestamp)}
                                </span>
                            </div>
                            
                            <h3 className={styles.projectName}>{item.projectName}</h3>
                            
                            <div className={styles.cardDetails}>
                                <p><strong>ID do Projeto:</strong> {item.projectId}</p>
                                <p><strong>Responsável:</strong> {item.Project?.responsibleFillingOut || 'Não especificado'}</p>
                            </div>
                            
                            <div className={styles.viewDetails}>
                                Clique para ver detalhes
                            </div>
                        </div>
                    ))}
                </div>
            )}
            
            {isDetailModalOpen && selectedHistory && (
                <ProjectHistoryDetail
                    historyItem={selectedHistory}
                    onClose={handleCloseDetailModal}
                />
            )}
        </div>
    );
};

export default ProjectHistory;
