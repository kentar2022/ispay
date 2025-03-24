async function initializeProgressTables() {
    try {
        const response = await fetch('scripts/initialize_progress_tables.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        if (!response.ok) {
            throw new Error('Ошибка при инициализации таблиц прогресса');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Ошибка при инициализации таблиц:', error);
        throw error;
    }
} 