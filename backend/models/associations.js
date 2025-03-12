import User from './user.js';
import Project from './Project.js';
import Test from './Test.js';
import Environment from './Environment.js';
import Documentation from './Documentation.js';
import Team from './Team.js';
import Security from './Security.js';
import AdditionalInfo from './AdditionalInfo.js';
import ProjectHistory from './ProjectHistory.js';

// User <-> Project associação
User.hasMany(Project, {
    foreignKey: 'userId',
    as: 'projects'
});

Project.belongsTo(User, {
    foreignKey: 'userId',
    as: 'Owner'
});

// Project <-> Test associação
Project.hasOne(Test, {
    foreignKey: 'projectId',
    as: 'tests'
});

Test.belongsTo(Project, {
    foreignKey: 'projectId'
});

// Project <-> Environment associação
Project.hasOne(Environment, {
    foreignKey: 'projectId',
    as: 'environments'
});

Environment.belongsTo(Project, {
    foreignKey: 'projectId'
});

// Project <-> Documentation associação
Project.hasOne(Documentation, {
    foreignKey: 'projectId',
    as: 'documentations'
});

Documentation.belongsTo(Project, {
    foreignKey: 'projectId'
});

// Project <-> Team associação
Project.hasOne(Team, {
    foreignKey: 'projectId',
    as: 'Teams'
});

Team.belongsTo(Project, {
    foreignKey: 'projectId'
});

// Project <-> Security associação
Project.hasOne(Security, {
    foreignKey: 'projectId',
    as: 'security'
});

Security.belongsTo(Project, {
    foreignKey: 'projectId'
});

// Project <-> AdditionalInfo associação
Project.hasOne(AdditionalInfo, {
    foreignKey: 'projectId',
    as: 'additionalInfos'
});

AdditionalInfo.belongsTo(Project, {
    foreignKey: 'projectId'
});

export {
    User,
    Project,
    Test,
    Environment,
    Documentation,
    Team,
    Security,
    AdditionalInfo,
    ProjectHistory
};

// Project History associations
User.hasMany(ProjectHistory, { foreignKey: 'userId' });
ProjectHistory.belongsTo(User, { foreignKey: 'userId' });
Project.hasMany(ProjectHistory, { foreignKey: 'projectId' });
ProjectHistory.belongsTo(Project, { foreignKey: 'projectId' });