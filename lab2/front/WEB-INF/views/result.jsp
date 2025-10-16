<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib prefix="c"  uri="jakarta.tags.core" %>
<%@ taglib prefix="fn" uri="jakarta.tags.functions" %>
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="utf-8" />
    <title>Web Lab 2</title>
    <link rel="stylesheet" href="${pageContext.request.contextPath}/static/css/styles.css" />
</head>
<body>
<header>
    Результат отправки точки
    <c:if test="${diff != 0}">
        , количество точек которые были отброшены:
        ${diff}
    </c:if>
</header>


<table class="table-compact">
    <colgroup>
        <col style="width: 30%" />
        <col style="width: 30%" />
        <col style="width: 40%" />
    </colgroup>

    <thead>
    <tr>
        <th>Ввод данных</th>
        <th>Значения</th>
        <th>Aim or miss</th>
    </tr>
    </thead>

    <tbody>
    <c:if test="${empty results}">
        <tr>
            <td colspan="3" style="text-align:center">Нет данных</td>
        </tr>
    </c:if>

    <c:forEach var="p" items="${results}" varStatus="st">
        <tr>
            <!-- ЛЕВАЯ КОЛОНКА: названия полей -->
            <td class="cell-normal">
                <p>X</p>
                <p>Y</p>
                <p>R</p>
                <p>Статус</p>
                <p>Текущее время</p>
                <p>Время работы</p>
            </td>

            <!-- ПРАВАЯ КОЛОНКА: значения для текущего Point -->
            <td class="cell-normal" data-x="${p.x}"
                data-y="${p.y}"
                data-r="${p.r}"
                data-hit="${p.hit}"
                data-status="${p.hit ? 'Точно в цель' : 'Надо тренироваться'}"
                data-now-time="${nowTime}"
                data-elapsed-ms="${elapsedMs}"
                style="vertical-align: top;">
                <p>${p.x}</p>
                <p>${p.y}</p>
                <p>${p.r}</p>
                <p><c:choose><c:when test="${p.hit}">Точно в цель</c:when><c:otherwise>Надо тренироваться</c:otherwise></c:choose></p>
                <p>${nowTime}</p>
                <p>${elapsedMs} мс</p>
            </td>

            <!-- ПРАВАЯ ЧАСТЬ С КАНВАСОМ: выводим один раз, объединяем по строкам -->
            <td style="text-align: center; vertical-align: top;">
                <video
                        width="500"
                        height="500"
                        autoplay
                        loop
                        muted
                        playsinline
                        controls>
                    <source src="${pageContext.request.contextPath}/static/video/${p.hit ? 'aim.mp4' : 'miss.mp4'}" type="video/mp4">
                    Ваш браузер не поддерживает воспроизведение видео.
                </video>
            </td>
        </tr>
    </c:forEach>

    <!-- Кнопка -->
    <tr>
        <td colspan="3" style="text-align: center;" >
            <a href="${pageContext.request.contextPath}/main" id="back_button">Назад</a>
        </td>
    </tr>
    </tbody>
</table>

<script src="${pageContext.request.contextPath}/static/js/result.js"></script>
</body>
</html>
