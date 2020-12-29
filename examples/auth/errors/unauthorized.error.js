export default class UnauthorizedError extends Error {
    constructor(message) {
        super(message || "UNAUTHORIZED");
    }
}
