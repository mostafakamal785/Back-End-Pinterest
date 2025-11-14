import { validationResult } from "express-validator";

const handleValidate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const [first] = errors.array();
    const maybeErrObj = first.msg && typeof first.msg === 'object' ? first.msg : null;
    const errToForward = maybeErrObj
      ? { message: maybeErrObj.message || 'Validation Error', status: maybeErrObj.status || 400, field: maybeErrObj.field || first.param }
      : { message: first.msg || 'Validation Error', status: 400, field: first.param };

    next(errToForward);
    return;
  }
  next();
}

export default handleValidate;