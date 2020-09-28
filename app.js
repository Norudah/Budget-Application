/**
 * Budget controlle. Heart of the application. Calculation and data storage.
 */
const budgetController = (function () {

    const Entry = function (id, type, description, value) {
        this.id = id;
        this.type = type;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    const data = {
        items: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0,
            total: 0,
            percentage: -1
        }
    };

    const calculateTotal = function (type) {
        let total = 0;
        data.items[type].forEach(function (entryObject) {
            total += entryObject.value;
        })
        data.totals[type] = total;
        return total;
    };

    return {

        addNewItem: function (type, description, value) {
            let id = 0;
            const length = data.items[type].length;

            if (length !== 0) {
                let lastElement = data.items[type][length - 1].id;
                id = lastElement + 1;
            }

            let newItem = new Entry(id, type, description, value);

            data.items[type].push(newItem);
            return newItem;
        },

        deleteItem: function (type, id) {
            const arr = data.items[type];
            let result = false;

            if (arr) {
                arr.forEach(function (currentItem, index) {
                    if (currentItem.id === id) {
                        arr.splice(index, 1);
                        result = true;
                        return 0;
                    }
                });
            }
            return result;
        },

        calculateBudget: function () {
            let inc = calculateTotal("inc");
            let exp = calculateTotal("exp");
            data.totals.total = inc - exp;
            data.totals.percentage = Math.round(exp / inc * 100);
        },

        getBudget: function () {
            return {
                expenses: data.totals.exp,
                incomes: data.totals.inc,
                total: data.totals.total,
                percentage: data.totals.percentage,
            }
        },

        calculatePercentages: function() {
            const inc = data.totals.inc;
            if (inc > 0) {
                data.items.exp.forEach(function(expense) {
                    expense.percentage = Math.round(expense.value / inc * 100);
                });
            }
        },

        getPercentage: function() {
            return data.items.exp.map(function (expense) {
                return expense.percentage;
            });
        }

    };

})();






/**
 * UI Controller. Anything related to inputs and displays
 */
const userInterfaceController = (function () {

    const DOMClasses = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetValue: '.budget__value',
        incomeValue: '.budget__income--value',
        expenseValue: '.budget__expenses--value',
        percentageValue: '.budget__expenses--percentage',
        containerList: '.container',
        expensePercentageLabel: '.item__percentage'
    };

    const formatCurrency = function(numberToFormat, type) {

        // FIXME : Formatting currency properly is harder than I thought. Using Intl.NumberFormat instead

        let symbol = '';

        const absoluteResult = new Intl.NumberFormat('de-DE', {style: 'currency', currency: 'EUR'}).format(numberToFormat);
        if (type === 'inc')
            symbol = '+ ';
        else if (type === 'exp')
            symbol = '- ';

        return symbol + absoluteResult;


        // console.log(numberToFormat);
        // let result = "";
        //
        // const fixedNumber = numberToFormat.toFixed(2);
        // const splitedNumber = fixedNumber.split('.');
        //
        // const length = splitedNumber[0].length
        // for (let i = length - 1; i >= 0; i--) {
        //     result += splitedNumber[0][i];
        //     if (i % 3 === 0 && i !== 0) {
        //         result += ',';
        //     }
        // }
        // console.log(result, typeof result);
        // result = result.split('').reverse().join('');
        // // result += '.' + splitedNumber[1];
        // console.log(result, typeof result);
        //
        //
        // console.log(result);
        // console.log("---");
    }

    return {

        getNewItem: function () {
            return {
                type: document.querySelector(DOMClasses.inputType).value,
                description: document.querySelector(DOMClasses.inputDescription).value,
                value: parseFloat(document.querySelector(DOMClasses.inputValue).value)
            }
        },

        getDOMClasses: function () {
            return DOMClasses;
        },

        clearFields: function () {

            const fields = document.querySelectorAll(DOMClasses.inputDescription + ',' + DOMClasses.inputValue);

            fields.forEach(function (currentElement) {
                currentElement.value = "";
            })

            fields[0].focus();


        },

        checkEmptyFields: function (description, value) {
            return (description !== "" && (!Object.is(value, NaN)));
        },

        addItemToUIList: function (newAddedItem) {

            let container, html;

            if (newAddedItem.type === "inc") {
                container = document.querySelector(DOMClasses.incomeContainer);
                html = '<div class="item clearfix" id="inc-%id%">\n' +
                    '                            <div class="item__description">%description%</div>\n' +
                    '                            <div class="right clearfix">\n' +
                    '                                <div class="item__value">%value%</div>\n' +
                    '                                <div class="item__delete">\n' +
                    '                                    <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>\n' +
                    '                                </div>\n' +
                    '                            </div>\n' +
                    '                        </div>'
            } else if (newAddedItem.type === "exp") {
                container = document.querySelector(DOMClasses.expenseContainer);
                html = '<div class="item clearfix" id="exp-%id%">\n' +
                    '                            <div class="item__description">%description%</div>\n' +
                    '                            <div class="right clearfix">\n' +
                    '                                <div class="item__value">%value%</div>\n' +
                    '                                <div class="item__percentage">21%</div>\n' +
                    '                                <div class="item__delete">\n' +
                    '                                    <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>\n' +
                    '                                </div>\n' +
                    '                            </div>\n' +
                    '                        </div>'
            } else {
                // errror
            }

            html = html.replace('%id%', newAddedItem.id);
            html = html.replace('%description%', newAddedItem.description);
            html = html.replace('%value%', formatCurrency(newAddedItem.value, newAddedItem.type));
            container.insertAdjacentHTML('beforeend', html);
        },


        getUIItemToBeDeleted: function (event) {
            const UIItem = event.target.parentNode.parentNode.parentNode.parentNode.id;
            const arr = UIItem.split('-');
            return {
                type: arr[0],
                id: parseInt(arr[1])
            };
        },

        deleteUIItem: function (type, id) {
            const item = document.getElementById(type + '-' + id);
            if (item) {
                item.remove();
            }
        },

        displayBudget: function (object) {
            document.querySelector(DOMClasses.budgetValue).textContent = formatCurrency(object.total);
            document.querySelector(DOMClasses.expenseValue).textContent = formatCurrency(object.expenses, 'exp');
            document.querySelector(DOMClasses.incomeValue).textContent = formatCurrency(object.incomes, 'inc');

            if (object.percentage > 0)
                document.querySelector(DOMClasses.percentageValue).textContent = object.percentage + ' %';
            else
                document.querySelector(DOMClasses.percentageValue).textContent = '---';
        },


        updateUIPercentages: function(expensePercentages, income) {
            const percentageFields = document.querySelectorAll(DOMClasses.expensePercentageLabel);

            percentageFields.forEach(function(node, index) {
                if (income > 0)
                    node.textContent = expensePercentages[index] + " %";
                else
                    node.textContent = "--";
            })
        }
    }
})();





/**
 * General controller of the application. Calling public methods from the budget and UI ones.
 */
const controller = (function (budgetController, userInterfaceController) {

    const DOMClass = userInterfaceController.getDOMClasses();

    const setupEventListeners = function () {
        document.querySelector(DOMClass.inputBtn).addEventListener("click", addNewItem);
        window.addEventListener("keypress", function (event) {
            if (event.code === "Enter")
                addNewItem();
        });
        document.querySelector(DOMClass.containerList).addEventListener('click', deleteItem);
    }

    const updatePercentages = function() {
        budgetController.calculatePercentages();
        const expensePercentages = budgetController.getPercentage();
        const income = budgetController.getBudget().incomes;
        userInterfaceController.updateUIPercentages(expensePercentages, income);
    };

    const updateBudget = function () {
        budgetController.calculateBudget();
        let budget = budgetController.getBudget();
        userInterfaceController.displayBudget(budget);
    };

    const addNewItem = function () {

        let newItem = userInterfaceController.getNewItem();

        if (userInterfaceController.checkEmptyFields(newItem.description, newItem.value)) {
            let newAddedItem = budgetController.addNewItem(newItem.type, newItem.description, newItem.value);
            userInterfaceController.addItemToUIList(newAddedItem);
            userInterfaceController.clearFields();
            updateBudget();
            updatePercentages();
        }
    };

    const deleteItem = function (event) {
        const item = userInterfaceController.getUIItemToBeDeleted(event);
        budgetController.deleteItem(item.type, item.id);
        userInterfaceController.deleteUIItem(item.type, item.id);
        updateBudget();
        updatePercentages();
    };

    return {
        initialization: function () {
            setupEventListeners();
        }
    }

})(budgetController, userInterfaceController);


controller.initialization();

// TODO 1 : Régler le INFINITY % dans l'affichage du budget