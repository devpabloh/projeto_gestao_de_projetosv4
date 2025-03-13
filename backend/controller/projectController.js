import Project from "../models/Project.js";
import User from "../models/user.js";
import Test from "../models/Test.js";
import Environment from "../models/Environment.js";
import Documentation from "../models/Documentation.js";
import Team from "../models/Team.js";
import Security from "../models/Security.js";
import AdditionalInfo from "../models/AdditionalInfo.js";
import ProjectHistory from "../models/ProjectHistory.js";

export async function createProject(requisicao, resposta) {
    try {
        const userId = requisicao.user.id;
        console.log('Received data:', requisicao.body);
        console.log('User ID:', userId);

        
        const formData = { ...requisicao.body };

        
        if (formData.hasDocumentation === 'sim') formData.hasDocumentation = true;
        else if (formData.hasDocumentation === 'não' || formData.hasDocumentation === 'nao') formData.hasDocumentation = false;
        
        if (formData.securityMeasures === 'sim') formData.securityMeasures = true;
        else if (formData.securityMeasures === 'não' || formData.securityMeasures === 'nao') formData.securityMeasures = false;
        
        if (formData.compliance === 'sim') formData.compliance = true;
        else if (formData.compliance === 'não' || formData.compliance === 'nao') formData.compliance = false;

        if (!formData.updatingTechnicalDocumentation || formData.updatingTechnicalDocumentation === '') {
            formData.updatingTechnicalDocumentation = null;
        } else {
            
            try {
                formData.updatingTechnicalDocumentation = new Date(formData.updatingTechnicalDocumentation);
                if (isNaN(formData.updatingTechnicalDocumentation)) {
                    formData.updatingTechnicalDocumentation = null;
                }
            } catch (e) {
                formData.updatingTechnicalDocumentation = null;
            }
        }

        if (!formData.updatingFunctionalDocumentation || formData.updatingFunctionalDocumentation === '') {
            formData.updatingFunctionalDocumentation = null;
        } else {
            
            try {
                formData.updatingFunctionalDocumentation = new Date(formData.updatingFunctionalDocumentation);
                if (isNaN(formData.updatingFunctionalDocumentation)) {
                    formData.updatingFunctionalDocumentation = null;
                }
            } catch (e) {
                formData.updatingFunctionalDocumentation = null;
            }
        }
        
        
        
        const project = await Project.create({
            userId,
            projectName: formData.projectName,
            projectDescription: formData.projectDescription,
            responsibleFillingOut: formData.responsibleFillingOut,
            responsibleContact: formData.responsibleContact,
            fillingDate: formData.fillingDate,
            developmentPhase: formData.developmentPhase,
            hasDocumentation: formData.hasDocumentation,
            documentationType: formData.documentationType
        });
        
        
        await Test.create({
            projectId: project.id,
            carriedOutTests: formData.carriedOutTests,
            selectedTests: formData.selectedTests,
            otherTestsDescription: formData.otherTestsDescription,
            frequencyAndAutomation: formData.frequencyAndAutomation,
            testingToolsUsed: formData.testingToolsUsed
        });
        
        
        await Environment.create({
            projectId: project.id,
            developmentEnvironment: formData.developmentEnvironment,
            approvalEnvironment: formData.approvalEnvironment,
            productionEnvironment: formData.productionEnvironment,
            deploymentEnvironmentNotes: formData.deploymentEnvironmentNotes
        });
        
        
        await Documentation.create({
            projectId: project.id,
            technicalDocumentation: formData.technicalDocumentation,
            linkTechnicalDocumentation: formData.linkTechnicalDocumentation,
            updatingTechnicalDocumentation: formData.updatingTechnicalDocumentation,
            updateTechnicalVersion: formData.updateTechnicalVersion,
            functionalDocumentation: formData.functionalDocumentation,
            linkFunctionalDocumentation: formData.linkFunctionalDocumentation,
            updatingFunctionalDocumentation: formData.updatingFunctionalDocumentation,
            updateFunctionalVersion: formData.updateFunctionalVersion
        });
        
        
        await Team.create({
            projectId: project.id,
            technicalLeaderName: formData.technicalLeaderName,
            projectManagerName: formData.projectManagerName,
            technicalSupport: formData.technicalSupport,
            supportName: formData.supportName,
            supportPeriod: formData.supportPeriod
        });
        
        
        await Security.create({
            projectId: project.id,
            securityMeasures: formData.securityMeasures,
            whatSecurityMeasures: formData.whatSecurityMeasures,
            otherSecurityMeasures: formData.otherSecurityMeasures,
            compliance: formData.compliance,
            whatCompliance: formData.whatCompliance,
            otherCompliance: formData.otherCompliance
        });
        
    
        await AdditionalInfo.create({
            projectId: project.id,
            challengesFaced: formData.challengesFaced,
            identifiedRisks: formData.identifiedRisks,
            additionalComments: formData.additionalComments
        });
        
        
        const user = await User.findByPk(userId);
        if (!user) {
            throw new Error("Usuário não encontrado");
        }
        
        
        await ProjectHistory.create({
            userId: userId,
            projectId: project.id,
            projectName: formData.projectName,
            userName: user.name, 
            actionType: 'create',
            changedFields: null,
            timestamp: new Date()
        });

        
        const completeProject = await Project.findOne({
            where: { id: project.id },
            include: [
                { model: User, as: 'Owner' },
                { model: Test, as: 'tests' },
                { model: Environment, as: 'environments' },
                { model: Documentation, as: 'documentations' },
                { model: Team, as: 'Teams' },
                { model: Security, as: 'security' },
                { model: AdditionalInfo, as: 'additionalInfos' }
            ]
        });
        
        resposta.status(201).json(completeProject);
    } catch (error) {
        console.error('Error creating project:', error);
        resposta.status(500).json({ error: error.message });
    }
}

export async function listProjects(requisicao, resposta) {
    try {
        const includes = [
            { model: User, as: 'Owner' },
            { model: Test, as: 'tests' },
            { model: Environment, as: 'environments' },
            { model: Documentation, as: 'documentations' },
            { model: Team, as: 'Teams' },
            { model: Security, as: 'security' },
            { model: AdditionalInfo, as: 'additionalInfos' }
        ];
        
        let projects;
        if (requisicao.user.role === 'admin') {
            projects = await Project.findAll({
                include: includes,
                distinct: true 
            });
        } else {
            projects = await Project.findAll({
                where: { userId: requisicao.user.id },
                include: includes,
                distinct: true 
            });
        }
        return resposta.json(projects);
    } catch (error) {
        console.error('Error in listProjects:', error);
        return resposta.status(500).json({ 
            error: 'Erro ao listar projetos',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}

export async function updateProject(requisicao, resposta) {
    try {
        const projectId = requisicao.params.id;
        const userId = requisicao.user.id;

        const project = await Project.findOne({ 
            where: { id: projectId },
            include: [
                { model: Test, as: 'tests' },
                { model: Environment, as: 'environments' },
                { model: Documentation, as: 'documentations' },
                { model: Team, as: 'Teams' },
                { model: Security, as: 'security' },
                { model: AdditionalInfo, as: 'additionalInfos' }
            ]
        });
        
        if (!project) {
            return resposta.status(404).json({ message: "O projeto não foi encontrado." });
        }

        if (requisicao.user.role !== "admin" && project.userId !== userId) {
            return resposta.status(403).json({ message: "Acesso negado, não é o proprietário do projeto." });
        }

        
        const oldValues = {};
        const newValues = {};
        const changedFields = {};
        
        
        const projectFields = ['projectName', 'projectDescription', 'responsibleFillingOut', 'responsibleContact', 
        'fillingDate', 'developmentPhase', 'hasDocumentation', 'documentationType'];
        
        projectFields.forEach(key => {
            if (requisicao.body[key] !== undefined && project[key] !== requisicao.body[key]) {
                oldValues[key] = project[key];
                newValues[key] = requisicao.body[key];
                changedFields[key] = {
                    old: project[key],
                    new: requisicao.body[key]
                };
            }
        });
        
        
        const compareAndTrackChanges = (modelName, modelObj, requestData) => {
            if (!modelObj) return;
            
            Object.keys(modelObj.dataValues).forEach(key => {
                
                if (['id', 'createdAt', 'updatedAt', 'projectId'].includes(key)) return;
                
                if (requestData[key] !== undefined && modelObj[key] !== requestData[key]) {
                    const fieldName = `${modelName}.${key}`;
                    changedFields[fieldName] = {
                        old: modelObj[key],
                        new: requestData[key]
                    };
                }
            });
        };
        
        
        if (project.tests) compareAndTrackChanges('tests', project.tests, requisicao.body);
        if (project.environments) compareAndTrackChanges('environments', project.environments, requisicao.body);
        if (project.documentations) compareAndTrackChanges('documentations', project.documentations, requisicao.body);
        if (project.Teams) compareAndTrackChanges('Teams', project.Teams, requisicao.body);
        if (project.security) compareAndTrackChanges('security', project.security, requisicao.body);
        if (project.additionalInfos) compareAndTrackChanges('additionalInfos', project.additionalInfos, requisicao.body);

        
        await project.update({
            projectName: requisicao.body.projectName || project.projectName,
            projectDescription: requisicao.body.projectDescription || project.projectDescription,
            responsibleFillingOut: requisicao.body.responsibleFillingOut || project.responsibleFillingOut,
            responsibleContact: requisicao.body.responsibleContact || project.responsibleContact,
            fillingDate: requisicao.body.fillingDate || project.fillingDate,
            developmentPhase: requisicao.body.developmentPhase || project.developmentPhase,
            hasDocumentation: requisicao.body.hasDocumentation !== undefined ? requisicao.body.hasDocumentation : project.hasDocumentation,
            documentationType: requisicao.body.documentationType || project.documentationType
        });

        
        if (project.tests) {
            await project.tests.update({
                carriedOutTests: requisicao.body.carriedOutTests || project.tests.carriedOutTests,
                selectedTests: requisicao.body.selectedTests || project.tests.selectedTests,
                otherTestsDescription: requisicao.body.otherTestsDescription || project.tests.otherTestsDescription,
                frequencyAndAutomation: requisicao.body.frequencyAndAutomation || project.tests.frequencyAndAutomation,
                testingToolsUsed: requisicao.body.testingToolsUsed || project.tests.testingToolsUsed
            });
        }

        
        if (project.environments) {
            await project.environments.update({
                developmentEnvironment: requisicao.body.developmentEnvironment || project.environments.developmentEnvironment,
                approvalEnvironment: requisicao.body.approvalEnvironment || project.environments.approvalEnvironment,
                productionEnvironment: requisicao.body.productionEnvironment || project.environments.productionEnvironment,
                deploymentEnvironmentNotes: requisicao.body.deploymentEnvironmentNotes || project.environments.deploymentEnvironmentNotes
            });
        }

        
        if (project.documentations) {
            await project.documentations.update({
                technicalDocumentation: requisicao.body.technicalDocumentation || project.documentations.technicalDocumentation,
                linkTechnicalDocumentation: requisicao.body.linkTechnicalDocumentation || project.documentations.linkTechnicalDocumentation,
                updatingTechnicalDocumentation: requisicao.body.updatingTechnicalDocumentation || project.documentations.updatingTechnicalDocumentation,
                updateTechnicalVersion: requisicao.body.updateTechnicalVersion || project.documentations.updateTechnicalVersion,
                functionalDocumentation: requisicao.body.functionalDocumentation || project.documentations.functionalDocumentation,
                linkFunctionalDocumentation: requisicao.body.linkFunctionalDocumentation || project.documentations.linkFunctionalDocumentation,
                updatingFunctionalDocumentation: requisicao.body.updatingFunctionalDocumentation || project.documentations.updatingFunctionalDocumentation,
                updateFunctionalVersion: requisicao.body.updateFunctionalVersion || project.documentations.updateFunctionalVersion
            });
        }

        // Atualizar equipe
        if (project.Teams) {
            await project.Teams.update({
                technicalLeaderName: requisicao.body.technicalLeaderName || project.Teams.technicalLeaderName,
                projectManagerName: requisicao.body.projectManagerName || project.Teams.projectManagerName,
                technicalSupport: requisicao.body.technicalSupport || project.Teams.technicalSupport,
                supportName: requisicao.body.supportName || project.Teams.supportName,
                supportPeriod: requisicao.body.supportPeriod || project.Teams.supportPeriod
            });
        }

        
        if (project.security) {
            await project.security.update({
                securityMeasures: requisicao.body.securityMeasures !== undefined ? requisicao.body.securityMeasures : project.security.securityMeasures,
                whatSecurityMeasures: requisicao.body.whatSecurityMeasures || project.security.whatSecurityMeasures,
                otherSecurityMeasures: requisicao.body.otherSecurityMeasures || project.security.otherSecurityMeasures,
                compliance: requisicao.body.compliance !== undefined ? requisicao.body.compliance : project.security.compliance,
                whatCompliance: requisicao.body.whatCompliance || project.security.whatCompliance,
                otherCompliance: requisicao.body.otherCompliance || project.security.otherCompliance
            });
        }

        
        if (project.additionalInfos) {
            await project.additionalInfos.update({
                challengesFaced: requisicao.body.challengesFaced || project.additionalInfos.challengesFaced,
                identifiedRisks: requisicao.body.identifiedRisks || project.additionalInfos.identifiedRisks,
                additionalComments: requisicao.body.additionalComments || project.additionalInfos.additionalComments
            });
        }
        
        
        if (Object.keys(changedFields).length > 0) {
            
            const user = await User.findByPk(userId);
            if (!user) {
                throw new Error("Usuário não encontrado");
            }
            
            await ProjectHistory.create({
                userId: userId,
                projectId: projectId,
                projectName: project.projectName,
                userName: user.name, 
                actionType: 'update',
                changedFields: changedFields,
                timestamp: new Date()
            });
        }
        
        
        const updatedProject = await Project.findOne({
            where: { id: projectId },
            include: [
                { model: User, as: 'Owner' },
                { model: Test, as: 'tests' },
                { model: Environment, as: 'environments' },
                { model: Documentation, as: 'documentations' },
                { model: Team, as: 'Teams' },
                { model: Security, as: 'security' },
                { model: AdditionalInfo, as: 'additionalInfos' }
            ]
        });
        
        resposta.status(200).json(updatedProject);
    } catch (error) {
        console.error('Error in updateProject:', error);
        resposta.status(500).json({ error: error.message });
    }
}


export async function deleteProject(requisicao, resposta) {
    try {
        const projectId = requisicao.params.id;
        const userId = requisicao.user.id;

        const project = await Project.findOne({ where: { id: projectId } });
        if (!project) {
            return resposta.status(404).json({ message: "O projeto não foi encontrado." });
        }

        
        if (requisicao.user.role !== 'admin' && project.userId !== userId) {
            return resposta.status(403).json({ message: "Você não tem permissão para deletar este projeto." });
        }

        
        await ProjectHistory.create({
            userId: userId,
            projectId: projectId,
            projectName: project.projectName,
            userName: requisicao.user.name,
            actionType: 'delete',
            changedFields: null,
            timestamp: new Date()
        });

        await project.destroy();
        resposta.status(200).json({ message: "Projeto deletado com sucesso." });
    } catch (error) {
        resposta.status(500).json({ error: error.message });
    }
}


export async function getProjectId(requisicao, resposta) {
    try {
        const projectId = requisicao.params.id;
        const userId = requisicao.user.id;

        const project = await Project.findOne({ 
            where: { id: projectId },
            include: [
                { model: User, as: 'Owner' },
                { model: Test, as: 'tests' },
                { model: Environment, as: 'environments' },
                { model: Documentation, as: 'documentations' },
                { model: Team, as: 'Teams' },
                { model: Security, as: 'security' },
                { model: AdditionalInfo, as: 'additionalInfos' }
            ]
        });
        
        if (!project) {
            return resposta.status(404).json({ message: "O projeto não foi encontrado." });
        }

        if (requisicao.user.role !== 'admin' && project.userId !== userId) {
            return resposta.status(403).json({ message: "Você não tem permissão para visualizar este projeto." });
        }

        resposta.status(200).json(project);
    } catch (error) {
        resposta.status(500).json({ error: "Ocorreu um erro interno no servidor" });
    }
}


