'use strict';

const Hapi = require('hapi')
var assets = require('./assets.js')
var mailchimp = require('./mailchimp.js')

const server = new Hapi.Server()
server.connection({ port: process.env.PORT || 3000 })

var crumbOptions = { 
  cookieOptions: { 
    clearInvalid: true,
    isSecure: true
 } 
}

server.register({ register: require('crumb'), options: crumbOptions }, (err) => {
  if (err) {
    console.log('Failed to load crumb.')
  }
  
  /* API endpoints */

  // mailchimp methods
  server.route({
      method: 'POST',
      path: '/api/mailchimp',
      config: {
        state: {
          parse: true,
          failAction: 'log' 
        }
      },
      handler: function (request, reply) {
        console.log('request',request)
        mailchimp.api(request, reply)
      }
  })

})

server.register(require('inert'), (err) => {
  if (err) {
    console.log('Failed to load inert.')
  }
  
  // A server redirect to our favorite band, Brave Combo.
  server.route({
    method: 'GET',
    path: '/bo/{path*}',
    handler: function (request, reply) {
      reply.redirect('http://bravecombo.com/' + (request.params.path ? request.params.path : ''))
    }
  })

  // Serves static files out of public/
  server.route({
    method: 'GET',
    path: '/{path*}',
    config: {
      state: {
        parse: true, 
        failAction: 'log' 
      }
    },
    handler: {
      directory: {
        path: './public'
      }
    }
  })

})

server.start(() => {
    console.log('Brave server running at:', server.info.uri);
});