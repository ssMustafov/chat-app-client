'use strict';

angular.module('chatApp', [
    'ngRoute',
    'ngCookies',
    'chatApp.chat.room',
    'chatApp.account.login',
    'chatApp.account.register',
    'chatApp.main.common',
    'chatApp.constants',
    'chatApp.atmosphere.service',
    'chatApp.chat.service',
    'chatApp.event.service',
    'chatApp.authentication.service',
    'chatApp.identity.service',
    'chatApp.room.service',
    'chatApp.users.service',
    'chatApp.thumbnail.directive',
    'ui-notification',
    'blockUI',
    'ui.bootstrap',
    'angularFileUpload',
    'pascalprecht.translate'
]).config(['$locationProvider', '$routeProvider', '$httpProvider', 'NotificationProvider', '$translateProvider',
        function ($locationProvider, $routeProvider, $httpProvider, notificationProvider, $translateProvider) {
    $locationProvider.hashPrefix('!');

    $routeProvider.otherwise({redirectTo: '/chat/room/1'});

    notificationProvider.setOptions({
        delay: 5000,
        startTop: 60,
        startRight: 20,
        verticalSpacing: 20,
        horizontalSpacing: 20,
        positionX: 'right',
        positionY: 'top'
    });

    $httpProvider.interceptors.push(['$q', '$injector', '$location', function($q, $injector, $location) {
        return {
            'responseError': function(rejection) {
                if (rejection.status === 401) {
                    $location.path('/account/login');
                }

                var Notification = $injector.get('Notification');
                if (rejection.data && rejection.data['message']) {
                    Notification.error({
                        title: 'Error',
                        message: rejection.data['message']
                    });
                }

                return $q.reject(rejection);
            }
        }
    }]);

    var translationsTable = getTranslations();
    Object.keys(translationsTable).forEach(function (lang) {
        $translateProvider.translations(lang, translationsTable[lang]);
    });
    $translateProvider.preferredLanguage('en');
}])
.constant('jQuery', $)
.run(['$rootScope', '$location', '$translate', 'AuthenticationService', 'EventService', 'blockUI', 'CHAT_EVENTS',
        function ($rootScope, $location, $translate, authenticationService, eventService, blockUi, chatEvents) {
    $rootScope.$on('$routeChangeStart', function(event, next) {
        if (next['data']) {
            var routeData = next['data'];
            if (routeData['requireAuthentication'] && !authenticationService.isAuthenticated()) {
                event.preventDefault();
                $location.path('/account/login');
            }
        }
    });

    authenticationService.refreshCookie();

    eventService.subscribe(chatEvents.ON_OPEN, function () {
        blockUi.stop();
    });
    eventService.subscribe(chatEvents.ON_CLOSE, function () {
        $translate('block.ui.text').then(function (label) {
            blockUi.start(label);
        });
    });
    eventService.subscribe(chatEvents.ON_REOPEN, function () {
        blockUi.stop();
    });
}]);

function getTranslations() {
    return {
        'en': {
            'block.ui.text': 'Trying to connect to the server...',
            'main.menu.user.settings': 'Settings',
            'main.menu.user.logout': 'Logout',
            'room.create': 'Create room',
            'room.list.header': 'Rooms',
            'room.users.header': 'Users',
            'room.files.header': 'Files',
            'room.settings.header': 'Room settings',
            'room.settings.btn.close': 'Close',
            'room.settings.tabs.users': 'Users',
            'room.settings.tabs.details': 'Details',
            'room.settings.users.add': 'Add users to the room',
            'room.settings.details.save': 'Update',
            'room.messages.search': 'Search...',
            'room.message.send.text': 'Type a message...',
            'room.message.not.found': 'No messages',
            'room.message.load.more': 'Load more messages',
            'room.create.header': 'Create room',
            'room.create.name': 'Room name',
            'room.create.name.short': 'Room name is too short',
            'room.create.name.long': 'Room name is too long',
            'room.create.description': 'Room description',
            'room.create.description.long': 'Room description is too long',
            'room.create.btn.save': 'Create',
            'room.create.btn.cancel': 'Cancel',
            'user.settings.header': 'User settings',
            'user.settings.tabs.info': 'Personal info',
            'user.settings.tabs.password': 'Change password',
            'user.settings.tabs.language': 'Language',
            'user.settings.btn.close': 'Close',
            'user.settings.info.username': 'Username',
            'user.settings.info.email': 'Email',
            'user.settings.info.email.valid': 'Enter a valid email',
            'user.settings.info.name': 'Name',
            'user.settings.info.name.long': 'The name is too long',
            'user.settings.info.btn.save': 'Save',
            'user.settings.password.current': 'Current password',
            'user.settings.password.current.short': 'Password is too short',
            'user.settings.password.current.long': 'Password is too long',
            'user.settings.password.new': 'New password',
            'user.settings.password.confirmation': 'Password confirmation',
            'user.settings.password.confirmation.match': 'Passwords don\'t match',
            'user.settings.password.btn.change': 'Change',
            'user.settings.lang.choose': 'Choose language',
            'user.settings.lang.choose.default': 'Please select',
            'user.settings.lang.choose.btn.change': 'Change',
            'login.header': 'Please login',
            'login.username': 'Username',
            'login.username.required': 'Username is required',
            'login.password': 'Password',
            'login.password.required': 'Password is required',
            'login.btn': 'Login',
            'login.btn.register': 'Register',
            'login.text.register': 'Register if you don\'t have account yet',
            'register.header': 'Register',
            'register.username': 'Username',
            'register.username.short': 'Username is too short',
            'register.username.long': 'Username is too long',
            'register.password': 'Password',
            'register.password.short': 'Password is too short',
            'register.password.long': 'Password is too long',
            'register.email': 'Email',
            'register.email.valid': 'Enter a valid email',
            'register.name': 'Name',
            'register.name.long': 'Name is too long',
            'register.btn': 'Register',
            'register.text.login': 'Login if you already have account',
            'register.btn.login': 'Login'
        },
        'bg': {
            'block.ui.text': 'Свързване със сървъра...',
            'main.menu.user.settings': 'Настройки',
            'main.menu.user.logout': 'Изход',
            'room.create': 'Създаване на стая',
            'room.list.header': 'Стаи',
            'room.users.header': 'Потребители',
            'room.files.header': 'Файлове',
            'room.settings.header': 'Настройки за стая',
            'room.settings.btn.close': 'Затваряне',
            'room.settings.tabs.users': 'Потребители',
            'room.settings.tabs.details': 'Детайли',
            'room.settings.users.add': 'Добавяне на потребител към стаята',
            'room.settings.details.save': 'Запазване',
            'room.messages.search': 'Търсене...',
            'room.message.send.text': 'Напишете съобщение...',
            'room.message.not.found': 'Няма съобщения',
            'room.message.load.more': 'Зареждане на стари съобщения',
            'room.create.header': 'Създаване на стая',
            'room.create.name': 'Име на стая',
            'room.create.name.short': 'Името на стаята е късо',
            'room.create.name.long': 'Името на стаята е дълго',
            'room.create.description': 'Описание на стаята',
            'room.create.description.long': 'Описанието на стаята е дълго',
            'room.create.btn.save': 'Създаване',
            'room.create.btn.cancel': 'Отказване',
            'user.settings.header': 'Потребителски настройки',
            'user.settings.tabs.info': 'Лични данни',
            'user.settings.tabs.password': 'Промяна на парола',
            'user.settings.tabs.language': 'Език',
            'user.settings.btn.close': 'Затваряне',
            'user.settings.info.username': 'Потребителско име',
            'user.settings.info.email': 'Имейл',
            'user.settings.info.email.valid': 'Въведете валиден имейл адрес',
            'user.settings.info.name': 'Име',
            'user.settings.info.name.long': 'Името е дълго',
            'user.settings.info.btn.save': 'Запазване',
            'user.settings.password.current': 'Текуща парола',
            'user.settings.password.current.short': 'Паролата е кратка',
            'user.settings.password.current.long': 'Паролата е дълга',
            'user.settings.password.new': 'Нова парола',
            'user.settings.password.confirmation': 'Потвърждение на паролата',
            'user.settings.password.confirmation.match': 'Паролите не съвпадат',
            'user.settings.password.btn.change': 'Смяна',
            'user.settings.lang.choose': 'Избиране на език',
            'user.settings.lang.choose.default': 'Моля изберете език',
            'user.settings.lang.choose.btn.change': 'Смяна',
            'login.header': 'Моля влезте в системата',
            'login.username': 'Потребителско име',
            'login.username.required': 'Потребителското име е задължително',
            'login.password': 'Парола',
            'login.password.required': 'Паролата е задължителна',
            'login.btn': 'Вход',
            'login.btn.register': 'Регистриране',
            'login.text.register': 'Ако нямате профил, регистрирайте се',
            'register.header': 'Регистрация',
            'register.username': 'Потребителско име',
            'register.username.short': 'Потребителското име е късо',
            'register.username.long': 'Потребителското име е дълго',
            'register.password': 'Парола',
            'register.password.short': 'Паролата е къса',
            'register.password.long': 'Паролата е дълга',
            'register.email': 'Имейл',
            'register.email.valid': 'Въведете валиден имейл адрес',
            'register.name': 'Име',
            'register.name.long': 'Името е дълго',
            'register.btn': 'Регистриране',
            'register.text.login': 'Влезте в системата, ако вече имате профил',
            'register.btn.login': 'Вход'
        }
    }
}