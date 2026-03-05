const fs = require('fs');

let content = fs.readFileSync('components/admin/admin-cars.tsx', 'utf8');

// Ясно, я продублировал закрывающие </div></div> из-за того, что три раза делал замену с replaceCheck/Checks.
// Строки 746-747 это лишние закрывающие дивы.

const search = `                      <Label htmlFor="fromEurope">Без пробега по РБ</Label>
                    </div>
                  </div>

                    </div>
                  </div>

                  {/* Характеристики */}`;
const replace = `                      <Label htmlFor="fromEurope">Без пробега по РБ</Label>
                    </div>
                  </div>

                  {/* Характеристики */}`;

content = content.replace(search, replace);
fs.writeFileSync('components/admin/admin-cars.tsx', content);
