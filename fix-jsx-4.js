const fs = require('fs');
let content = fs.readFileSync('components/admin/admin-cars.tsx', 'utf8');

// Похоже, где-то закрылся лишний div или не закрылся
const search = `                      </Button>
                    </div>
                  </div>

                  </div>

                  {/* Предпросмотр текущих данных формы */}`;

const replace = `                      </Button>
                    </div>
                  </div>

                  {/* Предпросмотр текущих данных формы */}`;

content = content.replace(search, replace);
fs.writeFileSync('components/admin/admin-cars.tsx', content);
