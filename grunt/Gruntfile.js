'use strict';

module.exports = function(grunt) {
    grunt.loadNpmTasks('grunt-config');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-connect-proxy');

    grunt.initConfig({
        connect: {
            app: {
                options: {
                    port: 4321,
                    protocol: 'http',
                    keepalive: true,
                    base: '../frontend/',
                    hostname: '*',
                    middleware: [require('grunt-connect-proxy/lib/utils').proxyRequest, require('serve-static')('../frontend/')]
                },
                proxies: [{
                    context: '/api',
                    host: 'localhost',
                    port: 4320,
                    https: false,
                    changeOrigin: false,
                    xforward: true
                }]
            }
        }

    });


    grunt.registerTask('live', ['configureProxies:app', 'connect:app']);

};