import { useState } from 'react';
import PropTypes from 'prop-types';
import styles from './ProjectHistoryDetail.module.css';

const ProjectHistoryDetail = ({ historyItem, onClose }) => {
    const [activeTab, setActiveTab] = useState('info');

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
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

    const renderChangedFields = () => {
        if (!historyItem.changedFields) {
            return <p className={styles.noChanges}>Não há detalhes de alterações disponíveis.</p>;
        }

        return (
            <div className={styles.changesTable}>
                <table>
                    <thead>
                        <tr>
                            <th>Campo</th>
                            <th>Valor Anterior</th>
                            <th>Novo Valor</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(historyItem.changedFields).map(([field, values]) => (
                            <tr key={field}>
                                <td>{formatFieldName(field)}</td>
                                <td className={styles.oldValue}>
                                    {formatFieldValue(values.old)}
                                </td>
                                <td className={styles.newValue}>
                                    {formatFieldValue(values.new)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    const formatFieldName = (fieldName) => {
        // Verificar se o campo pertence a um modelo relacionado (contém um ponto)
        const parts = fieldName.split('.');
        let modelPrefix = '';
        let actualFieldName = fieldName;
        
        if (parts.length > 1) {
            // É um campo de modelo relacionado
            const modelName = parts[0];
            actualFieldName = parts[1];
            
            // Mapear prefixos de modelos para nomes amigáveis
            const modelMap = {
                'tests': 'Testes',
                'environments': 'Ambiente',
                'documentations': 'Documentação',
                'Teams': 'Equipe',
                'security': 'Segurança',
                'additionalInfos': 'Informações Adicionais'
            };
            
            modelPrefix = modelMap[modelName] ? `${modelMap[modelName]} - ` : '';
        }
        
        // Mapeamento de nomes de campos para exibição mais amigável
        const fieldMap = {
            // Campos do projeto principal
            projectName: 'Nome do Projeto',
            projectDescription: 'Descrição',
            responsibleFillingOut: 'Responsável',
            responsibleContact: 'Contato do Responsável',
            developmentPhase: 'Fase de Desenvolvimento',
            hasDocumentation: 'Possui Documentação',
            documentationType: 'Tipo de Documentação',
            
            // Campos de testes
            carriedOutTests: 'Testes Realizados',
            selectedTests: 'Testes Selecionados',
            otherTestsDescription: 'Descrição de Outros Testes',
            frequencyAndAutomation: 'Frequência e Automação',
            testingToolsUsed: 'Ferramentas de Teste Utilizadas',
            
            // Campos de ambiente
            developmentEnvironment: 'Ambiente de Desenvolvimento',
            approvalEnvironment: 'Ambiente de Homologação',
            productionEnvironment: 'Ambiente de Produção',
            deploymentEnvironmentNotes: 'Notas de Ambiente de Implantação',
            
            // Campos de documentação
            technicalDocumentation: 'Documentação Técnica',
            linkTechnicalDocumentation: 'Link da Documentação Técnica',
            updatingTechnicalDocumentation: 'Atualização da Documentação Técnica',
            updateTechnicalVersion: 'Versão da Atualização Técnica',
            functionalDocumentation: 'Documentação Funcional',
            linkFunctionalDocumentation: 'Link da Documentação Funcional',
            updatingFunctionalDocumentation: 'Atualização da Documentação Funcional',
            updateFunctionalVersion: 'Versão da Atualização Funcional',
            
            // Campos de equipe
            technicalLeaderName: 'Nome do Líder Técnico',
            projectManagerName: 'Nome do Gerente de Projeto',
            technicalSupport: 'Suporte Técnico',
            supportName: 'Nome do Suporte',
            supportPeriod: 'Período de Suporte',
            
            // Campos de segurança
            securityMeasures: 'Medidas de Segurança',
            whatSecurityMeasures: 'Quais Medidas de Segurança',
            otherSecurityMeasures: 'Outras Medidas de Segurança',
            compliance: 'Conformidade',
            whatCompliance: 'Quais Conformidades',
            otherCompliance: 'Outras Conformidades',
            
            // Campos de informações adicionais
            challengesFaced: 'Desafios Enfrentados',
            identifiedRisks: 'Riscos Identificados',
            additionalComments: 'Comentários Adicionais'
        };

        return modelPrefix + (fieldMap[actualFieldName] || actualFieldName);
    };

    const formatFieldValue = (value) => {
        if (value === null || value === undefined) {
            return <span className={styles.nullValue}>Não informado</span>;
        }

        if (typeof value === 'boolean') {
            return value ? 'Sim' : 'Não';
        }

        if (value instanceof Date) {
            return formatDate(value);
        }

        if (typeof value === 'object') {
            return <pre>{JSON.stringify(value, null, 2)}</pre>;
        }

        return String(value);
    };

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2>
                        {getActionTypeLabel(historyItem.actionType)} de Projeto
                    </h2>
                    <button className={styles.closeButton} onClick={onClose}>
                        &times;
                    </button>
                </div>

                <div className={styles.tabs}>
                    <button 
                        className={`${styles.tabButton} ${activeTab === 'info' ? styles.active : ''}`}
                        onClick={() => setActiveTab('info')}
                    >
                        Informações Gerais
                    </button>
                    {historyItem.actionType === 'update' && (
                        <button 
                            className={`${styles.tabButton} ${activeTab === 'changes' ? styles.active : ''}`}
                            onClick={() => setActiveTab('changes')}
                        >
                            Alterações
                        </button>
                    )}
                </div>

                <div className={styles.tabContent}>
                    {activeTab === 'info' && (
                        <div className={styles.infoTab}>
                            <div className={styles.infoItem}>
                                <span className={styles.label}>Projeto:</span>
                                <span className={styles.value}>{historyItem.projectName}</span>
                            </div>
                            <div className={styles.infoItem}>
                                <span className={styles.label}>ID do Projeto:</span>
                                <span className={styles.value}>{historyItem.projectId}</span>
                            </div>
                            <div className={styles.infoItem}>
                                <span className={styles.label}>Ação:</span>
                                <span className={`${styles.value} ${styles[historyItem.actionType]}`}>
                                    {getActionTypeLabel(historyItem.actionType)}
                                </span>
                            </div>
                            <div className={styles.infoItem}>
                                <span className={styles.label}>Responsável:</span>
                                <span className={styles.value}>{historyItem.userName}</span>
                            </div>
                            <div className={styles.infoItem}>
                                <span className={styles.label}>Data e Hora:</span>
                                <span className={styles.value}>{formatDate(historyItem.timestamp)}</span>
                            </div>
                        </div>
                    )}

                    {activeTab === 'changes' && (
                        <div className={styles.changesTab}>
                            <h3>Campos Alterados</h3>
                            {renderChangedFields()}
                        </div>
                    )}
                </div>

                <div className={styles.modalFooter}>
                    <button className={styles.closeModalButton} onClick={onClose}>
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
};

ProjectHistoryDetail.propTypes = {
    historyItem: PropTypes.shape({
        id: PropTypes.number.isRequired,
        projectId: PropTypes.number.isRequired,
        projectName: PropTypes.string.isRequired,
        userName: PropTypes.string.isRequired,
        actionType: PropTypes.string.isRequired,
        changedFields: PropTypes.object,
        timestamp: PropTypes.string.isRequired,
        user: PropTypes.shape({
            id: PropTypes.number,
            name: PropTypes.string,
            email: PropTypes.string
        })
    }).isRequired,
    onClose: PropTypes.func.isRequired
};

export default ProjectHistoryDetail;
