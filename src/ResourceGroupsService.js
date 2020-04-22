const BaseService = require('watson-developer-cloud/lib/base_service').BaseService;
var extend = require("extend");

class ResourceGroupsService extends BaseService {

  constructor(userOptions) {
    super(userOptions);
    this._options.url = 'https://resource-manager.bluemix.net';
    return this;
  }

  list(params, callback) {
    var _params = extend({}, params);
    var _callback = (callback) ? callback : function () { };

    var parameters = {
      options: {
        url: '/v2/resource_groups',
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
}

ResourceGroupsService.prototype.name = 'resource_groups';
ResourceGroupsService.prototype.serviceVersion = 'v1';

module.exports = ResourceGroupsService;