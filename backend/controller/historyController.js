import { User, Project, ProjectHistory } from '../models/associations.js';


export async function getProjectHistory(requisicao, resposta) {
    try {
        
        if (requisicao.user.role !== 'admin') {
            return resposta.status(403).json({ message: "Acesso negado. Apenas administradores podem acessar o histórico." });
        }

        const history = await ProjectHistory.findAll({
            include: [
                { model: User, attributes: ['id', 'name', 'email'] },
                { model: Project, attributes: ['id', 'projectName','responsibleFillingOut']}
            ],
            order: [['timestamp', 'DESC']]
        });

        return resposta.status(200).json(history);
    } catch (error) {
        console.error('Error fetching project history:', error);
        return resposta.status(500).json({ 
            error: 'Erro ao buscar histórico de projetos',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}


export async function getProjectHistoryById(requisicao, resposta) {
    try {
        const projectId = requisicao.params.id;
        
        
        const project = await Project.findByPk(projectId);
        if (!project) {
            return resposta.status(404).json({ message: "Projeto não encontrado." });
        }
        
        if (requisicao.user.role !== 'admin' && project.userId !== requisicao.user.id) {
            return resposta.status(403).json({ message: "Acesso negado. Você não tem permissão para acessar este histórico." });
        }

        const history = await ProjectHistory.findAll({
            where: { projectId },
            include: [{ model: User, attributes: ['id', 'name', 'email'] }],
            order: [['timestamp', 'DESC']]
        });

        return resposta.status(200).json(history);
    } catch (error) {
        console.error('Error fetching project history by ID:', error);
        return resposta.status(500).json({ 
            error: 'Erro ao buscar histórico do projeto',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}
