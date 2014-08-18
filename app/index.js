(function () {

  'use strict';

  var fs                      = require('fs'),
      path                    = require('path'),
      yeoman                  = require('yeoman-generator'),
      chalk                   = require('chalk'),
      semver                  = require('semver'),
      currentWorkingDirectory = path.basename(process.cwd()),
      wiredep                 = require('wiredep'),
      yosay                   = require('yosay'),
      GruntfileEditor         = require('gruntfile-editor'),
      _                       = require('lodash'),

  hasOption, notes, final, final2, NgtailorGenerator;

  hasOption = function (options, option) {
    if (options) {
      return options.indexOf(option) !== -1;
    } else {
      return false;
    }
  };

  notes = [
    'You can invoke ngTailor in 2 modes:\n',
    '° Fast mode: Generate you an angularjs project with the minimal options.',
    '° Advanced mode: Lets you customize your scaffolding and add more features.\n',
  ].join('\n');

  final = [
    'Your angular project has been successfully generated.',
    'ngTailor has prepared some revelant grunt tasks for you.',
    'Run "grunt ls" to display them in your console.',
    '\n'
  ].join('\n');

  final2 = [
    'For more information about ngTailor and its grunt tasks, please see ',
    'https://github.com/lauterry/generator-ngtailor/blob/master/README.md',
    '\n'
  ].join('\n');

  NgtailorGenerator = yeoman.generators.Base.extend({

    init: function () {

      this.settings = {
        name: currentWorkingDirectory,
        angularVersion: '*',
        version: '0.0.1',
        description: '',
        csslint: false,
        complexity: false,
        revision: false,
        gitignore: false,
        i18n: false,
        e2eTest: false,
        unitTest: false,
        csspreprocessor: 'none',
        imagemin: false,
        resourceModule: false,
        cookieModule: false,
        sanitizeModule: false,
        routeModule: false,
        i18nModule: false,
        animateModule: false,
        touchModule: false,
        uiRouterModule: false,
        translateModule: false,
        snapModule: false,
        carouselModule: false,
        bindonceModule: false,
        thirdModules: false,
      };

      this.angularDeps = '';
      this.angularProviders = '';

      this.packageGruntTasks = '';
      this.ciGruntTasks = '';
      this.devGruntTasks = '';

      this.on('end', function () {
        if (!this.options['skip-install']) {
          this.installDependencies({
            callback : function () {
              this._gruntBowerInstall.call(this);
              this.log(chalk.green('\nBravo, your angular Project is ready! Please find below some grunt tasks prepared for you:\n'));
              this.spawnCommand('grunt', ['ls']);
            }.bind(this)
          });
        }
      });
    },

    /**
     * Ask for 'Fast mode' or 'Advanced mode'
     */
    askForMode: function () {
      var done = this.async();

      // have Yeoman greet the user
      this.log(yosay('Hello! let me introduce you to my friend ngTailor.'));

      this.log(chalk.magenta('ngTailor will scaffold out an AngularJS application, creating Grunt and Bower configurations with everything you need.\n'));

      this.log(chalk.cyan(notes));

      var prompts = [
        {
          type: 'list',
          name: 'mode',
          message: 'Which mode do you want to run?',
          choices: ['Fast', 'Advanced']
        }
      ];

      this.prompt(prompts, function (props) {

        this.mode = props.mode;

        if (this.mode === 'Fast') {
          this._generateGruntfile();
        }

        done();
      }.bind(this));
    },

    launchAdvancedMode: function () {

      if (this.mode === 'Advanced') {

        var done = this.async();

        var prompts = [
          {
            type: 'input',
            name: 'name',
            message: 'Name your project',
            default: currentWorkingDirectory
          },
          {
            type: 'input',
            name: 'angularVersion',
            message: 'Version of angular (leave blank to fetch the latest version available or specify one)',
            validate: function (value) {
              var valid = semver.validRange(value);
              if (valid === null) {
                return 'Please enter a valid semantic version (semver.org)';
              } else {
                return true;
              }
            }
          },
          {
            type: 'checkbox',
            name: 'modules',
            message: 'What official angular modules do you need ?',
            choices : [{
              value: 'resourceModule',
              name: 'angular-resource.js',
              checked: false
            }, {
              value: 'cookieModule',
              name: 'angular-cookies.js',
              checked: false
            }, {
              value: 'sanitizeModule',
              name: 'angular-sanitize.js',
              checked: false
            }, {
              value: 'routeModule',
              name: 'angular-route.js',
              checked: false
            }, {
              value: 'touchModule',
              name: 'angular-touch.js',
              checked: false
            }, {
              value: 'i18nModule',
              name: 'angular-i18n.js',
              checked: false
            }, {
              value: 'animateModule',
              name: 'angular-animate.js',
              checked: false
            }]
          },
          {
            type: 'checkbox',
            name: 'thirdModules',
            message: 'What amazing angular modules do you need ?',
            choices: [{
              value: 'uiRouterModule',
              name: 'angular-ui-router.js',
              checked: false
            }, {
              value: 'translateModule',
              name: 'angular-translate.js',
              checked: false
            }, {
              value: 'snapModule',
              name: 'angular-snap.js',
              checked: false
            }, {
              value: 'carouselModule',
              name: 'angular-carousel.js',
              checked: false
            }, {
              value: 'bindonceModule',
              name: 'angular-bindonce.js',
              checked: false
            }]
          },
          {
            type: 'checkbox',
            name: 'tests',
            message: 'Which tests should I set up ?',
            choices: [ 'unit', 'e2e' ]
          },
          {
            type: 'confirm',
            name: 'revision',
            message: 'Rename JS & CSS files for browser caching purpose ?  (i.e. app.js becomes 8664d46sf64.app.js)',
            default: false
          },
          {
            type: 'confirm',
            name: 'csslint',
            message: 'Should I lint your CSS with CSSLint',
            default: false
          },
          {
            type: 'list',
            name: 'csspreprocessor',
            message: 'Should I set up one of those CSS preprocessors ?',
            choices: [ 'none', 'sass', 'less' ],
            default: 0
          },
          {
            type: 'confirm',
            name: 'imagemin',
            message: 'Should I optimize your images (gif, png, jpeg) ?',
            default: false
          },
          {
            type: 'confirm',
            name: 'complexity',
            message: 'Should I generate a complexity report for your project ?',
            default: false
          }
        ];

        this.prompt(prompts, function (props) {

          _.each(this.settings, function (value, key) {
            this.settings[key] = props[key] || this.settings.key;
          }.bind(this));

          this._handleModules(props.modules, props.thirdModules);
          this._setUpTests();
          this._generateGruntfile();

          done();
        }.bind(this));
      }
    },

    app: function () {
      this.mkdir('app');
      this.template('app/_index.html', 'app/index.html');
      this.template('app/css/app.css', 'app/css/app.css');
      this.template('app/js/controllers/AppController.js', 'app/js/controllers/AppController.js');
      this.template('app/js/app.js', 'app/js/app.js');

      if (hasOption(this.settings.csspreprocessor, 'sass')) {
        this.copy('app/scss/style.scss', 'app/scss/style.scss');
        this.copy('app/scss/app.scss', 'app/scss/app.scss');
      } else if (hasOption(this.settings.csspreprocessor, 'less')) {
        this.copy('app/less/style.less', 'app/less/style.less');
        this.copy('app/less/app.less', 'app/less/app.less');
      }

      if (this.settings.unitTest) {
        this.template('test/conf/_unit-test-conf.js', 'test/conf/unit-test-conf.js');
        this.template('test/unit/appSpec.js', 'test/unit/appSpec.js');
      }

      if (this.settings.e2eTest) {
        this.copy('test/conf/e2e-test-conf.js', 'test/conf/e2e-test-conf.js');
        this.template('test/e2e/scenarios.js', 'test/e2e/scenarios.js');
      }

      if (this.settings.unitTest || this.settings.e2eTest) {
        this.copy('test/.jshintrc', 'test/.jshintrc');
      }

      this.template('_package.json', 'package.json');
      this.template('_bower.json', 'bower.json');
      //this.template('_Gruntfile.js', 'Gruntfile.js');
      this.template('_README.md', 'README.md');

    },

    configFiles: function () {
      this.copy('editorconfig', '.editorconfig');
      this.copy('jshintrc', '.jshintrc');
      this.copy('bowerrc', '.bowerrc');
      this.copy('gitignore', '.gitignore');
      if (this.csslint) {
        this.copy('csslintrc', '.csslintrc');
      }
    },


    /***************
     *   private   *
     ***************/

    _generateGruntfile : function () {
      var gruntFileContent = this.src.read('Gruntfile.js');

      this.env.gruntfile = new GruntfileEditor(gruntFileContent);

      if (this.settings.csslint) {
        this.gruntfile.insertConfig('csslint', '{ options: { csslintrc: \'.csslintrc\' }, all : { src : [\'<%= assetsDir %>/css/**/*.css\']}}');
        this.gruntfile.insertConfig('watch', '{css: {files: [\'<%= assetsDir %>/css/**/*.css\'],tasks: [\'csslint\']}}');
      }

      if (this.settings.csspreprocessor === 'less') {
        this.gruntfile.insertConfig('less', '{options: {paths: [\'<%= assetsDir %>/less\']},all: {files: {\'<%= assetsDir %>/css/app.css\': \'<%= assetsDir %>/less/app.less\'}}}');
        this.gruntfile.insertConfig('watch', '{less: {files : [\'<%= assetsDir %>/less/**/*.less\'],tasks: [\'less:all\']}}');
      }

      if (this.settings.csspreprocessor === 'sass') {
        this.gruntfile.insertConfig('sass', '{options : {style : \'expanded\',trace : true},all: {files: {\'<%= assetsDir %>/css/app.css\': \'<%= assetsDir %>/scss/app.scss\'}}}');
        this.gruntfile.insertConfig('watch', '{scss: {files : [\'<%= assetsDir %>/scss/**/*.scss\'],tasks: [\'sass:all\']}}');
      }

      if (this.settings.revision) {
        this.gruntfile.insertConfig('rev', '{dist: {files: {src: [\'<%= distDir %>/js/{,*/}*.js\',\'<%= distDir %>/css/{,*/}*.css\']}}}');
      }

      if (this.settings.complexity) {
        this.gruntfile.insertConfig('plato', '{options: {jshint : grunt.file.readJSON(\'.jshintrc\'),title : \'<%= name %>\'},all : {files: {\'reports/complexity\': [\'<%= assetsDir %>/js/**/*.js\']}}}');
        this.gruntfile.insertConfig('connect', '{plato : {options: {port: 8889, base: \'reports/complexity\', keepalive: true, open: true}}}');
      }

      if (this.settings.imagemin) {
        this.gruntfile.insertConfig('imagemin', '{dist : {options : {optimizationLevel: 7,progressive : false,interlaced : true},files: [{expand: true,cwd: \'<%= assetsDir %>/\',src: [\'**/*.{png,jpg,gif}\'],dest: \'<%= distDir %>/\'}]}}');
      }

      if (this.settings.unitTest && !this.settings.e2eTest) {
        this.gruntfile.insertConfig('karma', '{dev_unit: {options: {configFile: \'test/conf/unit-test-conf.js\',background: true, singleRun: false,autoWatch: true,reporters: [\'progress\']}},dist_unit: {options: {configFile: \'test/conf/unit-test-conf.js\',background: false,singleRun: true,autoWatch: false,reporters: [\'progress\', \'coverage\'],coverageReporter : {type : \'html\',dir : \'../reports/coverage\'}}}}');
      }

      if (this.settings.e2eTest && this.settings.unitTest) {
        this.gruntfile.insertConfig('karma', '{e2e: {options: {configFile: \test/conf/e2e-test-conf.js\'}}}');
      }

      if (this.settings.unitTest && this.settings.e2eTest) {
        this.gruntfile.insertConfig('karma', '{dev_unit: {options: {configFile: \'test/conf/unit-test-conf.js\',background: true, singleRun: false,autoWatch: true,reporters: [\'progress\']}},dist_unit: {options: {configFile: \'test/conf/unit-test-conf.js\',background: false,singleRun: true,autoWatch: false,reporters: [\'progress\', \'coverage\'],coverageReporter : {type : \'html\',dir : \'../reports/coverage\'}}}, e2e: {options: {configFile: \'test/conf/e2e-test-conf.js\'}}}');
      }

      this._prepareGruntTasks();

    },

    _prepareGruntTasks : function () {

      var packageTasks = [],
        ciTasks = [],
        devTasks = [];


      /*****************
       *  package Task *
       *****************/
      packageTasks.push('jshint');
      packageTasks.push('clean');
      packageTasks.push('useminPrepare');
      packageTasks.push('copy');
      packageTasks.push('concat');
      packageTasks.push('ngmin');
      packageTasks.push('uglify');

      if (hasOption(this.csspreprocessor, 'sass')) {
        packageTasks.push('sass');
      } else if (hasOption(this.csspreprocessor, 'less')) {
        packageTasks.push('less');
      }
      packageTasks.push('cssmin');
      if (this.revision) {
        packageTasks.push('rev');
      }
      if (this.imagemin) {
        packageTasks.push('imagemin');
      }
      packageTasks.push('usemin');

      if (packageTasks.length) {
        this.gruntfile.registerTask('package', packageTasks);
      }

      /*****************
       *    ci Task    *
       *****************/
      ciTasks.push('package');

      if (this.unitTest || this.e2eTest) {
        ciTasks.push('connect:test');
      }

      if (this.unitTest) {
        ciTasks.push('karma:dist_unit:start');
      }

      if (this.e2eTest) {
        ciTasks.push('karma:e2e');
      }

      if (this.complexity) {
        ciTasks.push('plato');
      }

      if (ciTasks.length) {
        this.gruntfile.registerTask('ci', ciTasks);
      }


      /*****************
       *    dev Task   *
       *****************/
      if (hasOption(this.csspreprocessor, 'sass')) {
        devTasks.push('sass');
      } else if (hasOption(this.csspreprocessor, 'less')) {
        devTasks.push('less');
      }
      devTasks.push('browserSync');

      if (this.unitTest) {
        devTasks.push('karma:dev_unit:start');
      }

      devTasks.push('watch');

      if (devTasks.length) {
        this.gruntfile.registerTask('dev', devTasks);
      }

      /*****************
       *    report Task   *
       *****************/
      if (this.complexity) {
        this.gruntfile.registerTask('report', ['plato', 'connect:plato']);
      }

      /*****************
       *    e2eTest Task   *
       *****************/
      if (this.e2eTest) {
        this.gruntfile.registerTask('test:e2e', ['connect:test', 'karma:e2e']);
      }

      /*****************
       *    unitTest Task   *
       *****************/
      if (this.unitTest) {
        this.gruntfile.registerTask('test:unit', ['karma:dist_unit:start']);
      }

    },

    _handleModules : function (modules, thirdModules) {
      var angMods = [],
        angProviders = [];

      this.settings.resourceModule = hasOption(modules, 'resourceModule');
      this.settings.cookieModule = hasOption(modules, 'cookieModule');
      this.settings.sanitizeModule = hasOption(modules, 'sanitizeModule');
      this.settings.routeModule = hasOption(modules, 'routeModule');
      this.settings.i18nModule = hasOption(modules, 'i18nModule');
      this.settings.animateModule = hasOption(modules, 'animateModule');
      this.settings.touchModule = hasOption(modules, 'touchModule');

      this.settings.uiRouterModule = hasOption(thirdModules, 'uiRouterModule');
      this.settings.translateModule = hasOption(thirdModules, 'translateModule');
      this.settings.snapModule = hasOption(thirdModules, 'snapModule');
      this.settings.carouselModule = hasOption(thirdModules, 'carouselModule');
      this.settings.bindonceModule = hasOption(thirdModules, 'bindonceModule');

      if (this.settings.resourceModule) {
        angMods.push('\'ngResource\'');
      }
      if (this.settings.cookieModule) {
        angMods.push('\'ngCookies\'');
      }
      if (this.settings.sanitizeModule) {
        angMods.push('\'ngSanitize\'');
      }
      if (this.settings.routeModule) {
        angMods.push('\'ngRoute\'');
      }
      if (this.settings.animateModule) {
        angMods.push('\'ngAnimate\'');
      }
      if (this.settings.touchModule) {
        angMods.push('\'ngTouch\'');
      }

      if (this.settings.uiRouterModule) {
        angMods.push('\'ui.router\'');
        angProviders.push('$stateProvider');
        angProviders.push('$urlRouterProvider');
      }
      if (this.settings.translateModule) {
        angMods.push('\'pascalprecht.translate\'');
        angProviders.push('$translateProvider');
      }
      if (this.settings.snapModule) {
        angMods.push('\'snap\'');
      }
      if (this.settings.carouselModule) {
        angMods.push('\'angular-carousel\'');
      }
      if (this.settings.bindonceModule) {
        angMods.push('\'pasvaz.bindonce\'');
      }

      if (angMods.length) {
        this.angularDeps = '\n    ' + angMods.join(',\n    ') + '\n';
        this.angularProviders = angProviders.join(', ');
      }
    },

    _setUpTests : function () {
      this.settings.e2eTest = hasOption(this.tests, 'e2e');
      this.settings.unitTest = hasOption(this.tests, 'unit');
    },

    _gruntBowerInstall : function () {
      wiredep({
        directory: 'app/vendor',
        bowerJson: JSON.parse(fs.readFileSync('./bower.json')),
        ignorePath: 'app/',
        src: 'app/index.html',
        fileTypes: {
          html: {
            replace: {
              css: '<link rel="stylesheet" href="{{filePath}}">'
            }
          }
        }
      });
    }
  });

  module.exports = NgtailorGenerator;

})();
