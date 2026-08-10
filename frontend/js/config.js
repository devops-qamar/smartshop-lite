/**
 * Runtime configuration for the frontend.
 * Change this value (or override window.SMARTSHOP_API_BASE_URL before this
 * script runs) to point the frontend at a different backend, e.g. when
 * running behind Docker or deployed to a real domain.
 */
window.SMARTSHOP_API_BASE_URL = window.SMARTSHOP_API_BASE_URL || 'http://localhost:5000/api';
