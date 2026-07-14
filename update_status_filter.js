const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'pages', 'Users.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Update filteredUsers logic
const oldFilterLogic = `        Object.entries(columnFilters).forEach(([key, value]) => {
            if (value && value.trim() !== '') {
                const lowerValue = value.toLowerCase().trim();
                result = result.filter(u => {
                    let fieldVal = '';
                    if (key === 'role') fieldVal = u.role === 'admin' ? 'Administrador' : 'Orientador';
                    else if (key === 'email') fieldVal = u.realEmail || '';
                    else fieldVal = u[key] || '';
                    
                    return String(fieldVal).toLowerCase().trim() === lowerValue;
                });
            }
        });`;

const newFilterLogic = `        Object.entries(columnFilters).forEach(([key, value]) => {
            if (value && value.trim() !== '') {
                if (key === 'status') {
                    if (value === 'activos') {
                        result = result.filter(u => !u.disabled);
                    }
                    return;
                }

                const lowerValue = value.toLowerCase().trim();
                result = result.filter(u => {
                    let fieldVal = '';
                    if (key === 'role') fieldVal = u.role === 'admin' ? 'Administrador' : 'Orientador';
                    else if (key === 'email') fieldVal = u.realEmail || '';
                    else fieldVal = u[key] || '';
                    
                    return String(fieldVal).toLowerCase().trim() === lowerValue;
                });
            }
        });`;

content = content.replace(oldFilterLogic, newFilterLogic);

// Update Acciones header
const oldHeader = `<th style={{ width: '1px', verticalAlign: 'top' }}>
                                    <div style={{ marginBottom: '8px' }}>Acciones</div>
                                    {Object.keys(columnFilters).length > 0 && (
                                        <Button type="button" onClick={clearFilters} variant="secondary" style={{ padding: '0 8px', fontSize: '0.8rem', height: '32px' }}>
                                            Limpiar
                                        </Button>
                                    )}
                                </th>`;

const newHeader = `<th style={{ width: '1px', verticalAlign: 'top' }}>
                                    <div style={{ marginBottom: '8px' }}>Acciones</div>
                                    <select className="table-filter-input" style={{ marginBottom: '8px', minWidth: '110px' }} value={columnFilters.status || ''} onChange={e => handleFilterChange('status', e.target.value)}>
                                        <option value="">Filtrar todos</option>
                                        <option value="activos">Filtrar activos</option>
                                    </select>
                                    {Object.keys(columnFilters).filter(k => columnFilters[k] && columnFilters[k] !== '').length > 0 && (
                                        <Button type="button" onClick={clearFilters} variant="secondary" style={{ padding: '0 8px', fontSize: '0.8rem', height: '32px' }}>
                                            Limpiar
                                        </Button>
                                    )}
                                </th>`;

content = content.replace(oldHeader, newHeader);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated status filter in Users.jsx');
