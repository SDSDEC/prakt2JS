new Vue({
    el: '#app',
    template: `
        <div>
            <div class="create-card">
                <h3>Создать карточку</h3>
                <div>
                    <label>Заголовок:</label>
                    <input v-model="newCardTitle" placeholder="Заголовок">
                </div>
                <div>
                    <label>Пункты:</label>
                    <div v-for="(item, index) in newCardItems" :key="index">
                        <input v-model="newCardItems[index]" placeholder="Пункт">
                        <button @click="removeItem(index)" v-if="newCardItems.length > 3">Удалить</button>
                    </div>
                </div>
            </div>
        </div>
    `,
    data: {
        columns: [
            { name: 'Нужно выполнить (макс.3)', cards: [] },
            { name: 'Выполняется (макс.5)', cards: [] },
            { name: 'Выполнено', cards: [] }
        ],
        newCardTitle: '',
        newCardItems: ['', '', '']
    },

})