
export const dataTypeConverter = (req, res, next) => {
    if (req.body) {
        
        const booleanFields = ['hasDocumentation', 'securityMeasures', 'compliance'];
        
        for (const field of booleanFields) {
            if (req.body[field] !== undefined) {
                
                if (req.body[field] === 'sim') {
                    req.body[field] = true;
                }
                
                else if (req.body[field] === 'não' || req.body[field] === 'nao') {
                    req.body[field] = false;
                }
            }
        }
    }
    
    next();
};