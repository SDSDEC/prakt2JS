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
                    <button @click="addItem" v-if="newCardItems.length < 5">Добавить пункт</button>
                </div>
                <button @click="createCard">Создать карточку</button>
                <p v-if="firstColumnFull" class="warning">Первая колонка заполнена (максимум 3)</p>
            </div>  
            <div class="board">
                <div class="column" v-for="(column, colIndex) in columns" :key="colIndex">
                    <h2>{{ column.name }} ({{ column.cards.length }})</h2>
                    <div class="card" v-for="(card, cardIndex) in column.cards" :key="card.id" :style="{ backgroundColor: card.color }">
                        <button class="delete-card" @click="removeCard(card.id, colIndex)">✖</button>
                        <h3>{{ card.title }}</h3>
                        <ul>
                            <li v-for="(item, i) in card.items" :key="i">
                                <input type="checkbox"
                                    v-model="item.completed"
                                    @change="handleItemChange(card, colIndex, cardIndex)"
                                    :disabled="isFirstColumnBlocked && colIndex === 0">
                                    {{ item.text }}
                            </li>
                        </ul>
                        <div class="color-select">
                            <select v-model="card.color" @change="forceUpdate">
                                <option value="#ffffff">Белый</option>
                                <option value="#ffcccc">Красный</option>
                                <option value="#ccffcc">Зелёный</option>
                                <option value="#ccccff">Синий</option>
                            </select>
                        </div>
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
    computed: {
        firstColumnFull() {
            return this.columns[0].cards.length >= 3;
        },
        isFirstColumnBlocked() {
            if (this.columns[1].cards.length < 5) return false;
            return this.columns[0].cards.some(card=> {
                const percent = this.getCardPercent(card);
                return percent > 50 && percent < 100;
            });
        }
    },
    methods: {
        addItem() {
            if (this.newCardItems.length < 5) {
                this.newCardItems.push('');
            }
        },
        removeItem(index) {
            if (this.newCardItems.length > 3) {
                this.newCardItems.splice(index, 1);
            }
        },
        createCard() {
            if (!this.newCardTitle) return alert('Введите заголовок');
            if (this.newCardItems.some(item => !item.trim())) return alert('Заполните все пункты');
            if (this.firstColumnFull) {
                alert('Первая колонка заполнена');
                return;
            }
            const newCard = {
                id: Date.now(),
                title: this.newCardTitle,
                items: this.newCardItems.map(text => ({text, completed: false})),
                color: '#ffffff',
                completed: null
            };
            this.columns[0].cards.push(newCard);
            this.newCardTitle = '';
            this.newCardItems = ['', '', ''];
        },
        getCardPercent(card) {
            const total = card.items.length;
            const completed = card.items.filter(i => i.completed).length;
            return total === 0 ? 0 : (completed / total) * 100;
        },
        removeCard(cardId, colIndex) {
            const column = this.columns[colIndex];
            const cardIndex = column.cards.findIndex(card => card.id === cardId);
            if (cardIndex !== -1) {
                column.cards.splice(cardIndex, 1);
            }
        },
        forceUpdate() {
            this.$forceUpdate();
        },
        handleItemChange(card, colIndex, cardIndex) {
            this.$forceUpdate();
            this.checkAndMoveCard(card, colIndex, cardIndex);
        },
        checkAndMoveCard(card, colIndex, cardIndex) {
            const percent = this.getCardPercent(card);
            let targetCol = null;

            if (colIndex === 0) {
                if (percent === 100) {
                    targetCol = 2;
                } else if (percent > 50) {
                    targetCol = 1;
                }
            } else if (colIndex === 1) {
                if (percent === 100) {
                    targetCol = 2;
                } else if (percent <= 50) {
                    if (this.columns[0].cards.length < 3 && !this.isFirstColumnBlocked) {
                        targetCol = 0;
                    }
                }
            } else if (colIndex === 2) {
                if (percent < 100) {
                    targetCol = 1;
                }
            }

            if (targetCol !== null && targetCol !== colIndex) {
                if (targetCol === 0 && this.columns[0].cards.length >= 3) return;
                if (targetCol === 1 && this.columns[1].cards.length >= 5) return;
                this.moveCard(card, colIndex, cardIndex, targetCol);
            }
        },
        moveCard(card, fromColIndex, cardIndex, toColIndex) {
            this.columns[fromColIndex].cards.splice(cardIndex, 1);
            if (toColIndex === 2) {
                card.completed = new Date().toLocaleString();
            } else if (fromColIndex === 2) {
                card.completed = null;
            }
            this.columns[toColIndex].cards.push(card);
            this.$nextTick(() => {
                this.checkFirstColumnCards();
            });
        },
        checkFirstColumnCards() {
            const firstColCards = [...this.columns[0].cards];
            for (let card of firstColCards) {
                const actualIndex = this.columns[0].cards.findIndex(c => c.id === card.id);
                if (actualIndex === -1) continue;
                const percent = this.getCardPercent(card);
                if (percent === 100) {
                    this.moveCard(card, 0, actualIndex, 2);
                } else if (percent > 50 && this.columns[1].cards.length < 5) {
                    this.moveCard(card, 0, actualIndex, 1);
                }
            }
        }
    },
    watch: {
        columns: {
            handler() {
                localStorage.setItem('noteAppData', JSON.stringify(this.columns));
            },
            deep: true
        }
    },
    mounted() {
        const saved = localStorage.getItem('noteAppData');
        if (saved) {
            this.columns = JSON.parse(saved);

        }
    }
});