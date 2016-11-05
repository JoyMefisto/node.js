"use strict";

let express = require('express'),
    request = require('request'),
    path = require('path'),
    cheerio = require('cheerio'),
    bodyParser = require('body-parser'),
    app = express();

let templating = require('consolidate');
// hbs-расширение шаблонов
// наш шаблонизатор это handlebars
app.engine('hbs', templating.handlebars);
// view engine-нужно чтобы не дописывать всё время расширение hbs
app.set('view engine', 'hbs');
// Устанавливаем директорию из которой будут браться шаблоны
app.set('views', __dirname);

// Для работы с json
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.get("/", function (req, res) {
    res.render('index', {
        title: 'Граббер',
        title_name: 'Граббер статей'
    });
});

// Приходит запрос на получение статей по переданным параметрам
app.post('/article', function (req, res) {
    getContent({ 'url': req.body.url, 'count': req.body.num }, function (data) {
        res.json(data);
    });
});

// Отдаём статьи
function getContent(req, callback) {
    request(req.url, function (error, response, html) {
        if(error || response.statusCode != 200) {
            callback({ 'status': 'error' });
            return;
        }

        let data = [];
        let $ = cheerio.load(html);
        let dom = $('.posts_list .posts .post');

        dom.each(function (i, element) {
            if(i > req.count - 1){
                return;
            }

            let title = $(this).find('.post__title a').text();
            let article = $(this).find('.html_format').text();

            data.push({ 'title': title, 'article': article });
        });

        callback({ 'status': 'success', 'data': data});
    });
}

app.listen(8080);
console.log('http://127.0.0.1:8080');