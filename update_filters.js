const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'pages', 'Users.jsx');
let content = fs.readFileSync(filePath, 'utf8');

const target = `    // Update filter wrapper
    const handleFilterChange = (column, value) => {
        setColumnFilters(prev => ({ ...prev, [column]: value }));
        setCurrentPage(1);
    };

    const clearFilters = () => {
        setColumnFilters({});
        setCurrentPage(1);
    };`;

const replacement = `    // Update filter wrapper
    const handleFilterChange = (column, value) => {
        setColumnFilters(prev => {
            const newFilters = { ...prev };
            if (value === '') {
                delete newFilters[column];
            } else {
                newFilters[column] = value;
            }
            localStorage.setItem('usersTableFilters', JSON.stringify(newFilters));
            return newFilters;
        });
        setCurrentPage(1);
    };

    const clearFilters = () => {
        setColumnFilters({});
        localStorage.removeItem('usersTableFilters');
        setCurrentPage(1);
    };`;

content = content.replace(target, replacement);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated handleFilterChange in Users.jsx');
