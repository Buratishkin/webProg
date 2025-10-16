<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="utf-8" />
    <title>Web Lab 2</title>
    <link rel="stylesheet" href="${pageContext.request.contextPath}/static/css/styles.css" />
</head>
<body>
<header>Новиков Даниил Дмитриевич, P3231, вариант 466903</header>

<table>
    <colgroup>
        <col style="width: 21%" />
        <col style="width: 40%" />
        <col style="width: 25%" />
    </colgroup>

    <thead>
    <tr>
        <th>Ввод данных</th>
        <th>Координатная плоскость</th>
        <th>Таблица результата</th>
    </tr>
    </thead>

    <tbody>
    <tr>
        <form method="GET" action="${pageContext.request.contextPath}/main" id="data_form">
            <!-- Выбор X -->
            <td>
                <div class="input-group">
                    <label for="x_input">X</label><br>
                    <label><input type="checkbox" name="x" value="-5">-5</label>
                    <label><input type="checkbox" name="x" value="-4">-4</label>
                    <label><input type="checkbox" name="x" value="-3">-3</label>
                    <label><input type="checkbox" name="x" value="-2">-2</label>
                    <label><input type="checkbox" name="x" value="-1">-1</label>
                    <label><input type="checkbox" name="x" value="0">0</label>
                    <label><input type="checkbox" name="x" value="1">1</label>
                    <label><input type="checkbox" name="x" value="2">2</label>
                    <label><input type="checkbox" name="x" value="3">3</label>
                    <div class="field_error">${errors.x}</div>
                </div>
                <!-- Ввод Y -->
                <div class="input-group">
                    <label for="y_input">Y</label>
                    <input
                            type="text"
                            id="y_input"
                            name="y"
                            placeholder="значение от -5 до 3"
                    />
                    <div class="field_error">${errors.y}</div>
                </div>
                <!-- Выбор R -->
                <div class="input-group">
                    <label>R</label><br>
                    <div class="r-buttons">
                        <button id="r_button" type="button" class="r-btn" data-value="1">1</button>
                        <button id="r_button" type="button" class="r-btn" data-value="2">2</button>
                        <button id="r_button" type="button" class="r-btn" data-value="3">3</button>
                        <button id="r_button" type="button" class="r-btn" data-value="4">4</button>
                        <button id="r_button" type="button" class="r-btn" data-value="5">5</button>
                    </div>
                    <div class="field_error">${errors.r}</div>
                </div>
            </td>
        </form>

        <!-- Координатная плоскость -->
        <td rowspan="2" style="text-align: center;">
            <canvas id="graph_canvas"
                    width="500" height="500">
            </canvas>
        </td>

        <!-- Таблица результата -->
        <td>
            <div style="max-height: 500px; overflow-y: auto;">
                <table>
                    <colgroup>
                        <col style="width: 10%" />
                        <col style="width: 10%" />
                        <col style="width: 10%" />
                        <col style="width: 16%" />
                        <col style="width: 27%" />
                        <col style="width: 27%" />
                    </colgroup>
                    <thead>
                    <tr>
                        <th>X</th>
                        <th>Y</th>
                        <th>R</th>
                        <th>Статус</th>
                        <th>Текущее время</th>
                        <th>Время работы</th>
                    </tr>
                    </thead>
                    <tbody id="results_table_body"></tbody>
                </table>
            </div>
        </td>
    </tr>

    <tr>
        <td>
        </td>
        <td style="text-align: center;">
            <button id="delete_button">Очистить таблицу</button>
        </td>
    </tr>

    <!-- Кнопка отправки -->
    <tr>
        <td colspan="3" style="text-align: center;">
            <button type="submit" id="submit_button" form="data_form">Отправить</button>
        </td>
    </tr>
    </tbody>
</table>

<script src="${pageContext.request.contextPath}/static/js/script.js"></script>
</body>
</html>