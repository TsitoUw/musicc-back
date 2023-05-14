

export const created = (payload:string|object|undefined) => {
  if(typeof payload === "object")
  return { status: 201, data: payload };
};
export const success = (data = "succes") => {
  return { status: 200, data: data };
};

export const errServer = (error = "internal server error") => {
  return { status: 500, error: error };
};

export const errException = (error = "invalid informations given") => {
  return { status: 417, error: error };
};

export const errNotFound = (error = "not found") => {
  return { status: 404, error: error };
};

export const errFailed = (error?:string) => {
  return { status: 400, error: error };
};

export const errUnauthorized = (error = "not authorized do the action") => {
  return { status: 403, error: error };
};
