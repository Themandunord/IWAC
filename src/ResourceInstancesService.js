const BaseService = require('watson-developer-cloud/lib/base_service').BaseService;
var extend = require("extend");

class ResourceInstancesService extends BaseService {

  constructor(userOptions) {
    super(userOptions);
    this._options.url = 'https://resource-controller.bluemix.net';
    return this;
  }

  list(params, callback) {
    var _params = extend({}, params);
    var _callback = (callback) ? callback : function () { };

    var parameters = {
      options: {
        url: '/v2/resource_instances',
        method: 'GET',
        json: true,
      },
      defaultOptions: extend(true, {}, this._options, {
        headers: extend(true, {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }, _params.headers),
      }),
    };
    return this.createRequest(parameters, _callback);
  }

  createInstance(params, callback) {
    var _params = extend({}, params);
    var _callback = (callback) ? callback : function () { };

    var body = {
      'name': _params.name,
      'target': _params.target || 'eu-de',
      'resource_group': _params.resource_group,
      'resource_plan_id': _params.resource_plan_id,
    };

    var parameters = {
      options: {
        url: '/v2/resource_instances',
        method: 'POST',
        json: true,
        body,
      },
      defaultOptions: extend(true, {}, this._options, {
        headers: extend(true, {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }, _params.headers),
      }),
    };
    return this.createRequest(parameters, _callback);
  }

  createResourceBinding(params, callback) {
    var _params = extend({}, params);
    var _callback = (callback) ? callback : function () { };

    var body = {
      "name": _params.name,
      "source": _params.source,
      "role": _params.role || "Writer",
    };

    var parameters = {
      options: {
        url: '/v2/resource_bindings',
        method: 'POST',
        json: true,
        body,
      },
      defaultOptions: extend(true, {}, this._options, {
        headers: extend(true, {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }, _params.headers),
      }),
    };
    return this.createRequest(parameters, _callback);
  }
}

ResourceInstancesService.prototype.name = 'resource_instances';
ResourceInstancesService.prototype.serviceVersion = 'v1';

module.exports = ResourceInstancesService;