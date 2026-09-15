const fs = require('fs');
const path = require('path');

const uploadsPath = process.env.RUTALLER_UPLOADS_PATH
  || path.join(__dirname, '..', '..', '..', 'database', 'uploads');

if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}

module.exports = { uploadsPath };
