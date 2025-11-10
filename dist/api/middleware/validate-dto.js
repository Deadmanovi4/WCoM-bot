"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateId = void 0;
exports.validateDto = validateDto;
const ajv_instance_1 = require("./ajv-instance");
function validateDto(ajvValidate) {
    return (req, res, next) => {
        const valid = ajvValidate(req.body);
        if (!valid) {
            const errors = ajvValidate.errors;
            console.log(errors);
            res.status(400).json({ errors });
            return;
        }
        next();
    };
}
const idSchema = {
    type: 'string',
    format: 'id'
};
exports.validateId = ajv_instance_1.ajv.compile(idSchema);