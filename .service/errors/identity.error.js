export default class IdentityError extends Error {
  constructor(message) {
    super(message || 'UNAUTHORIZED');
  }
}
