const assert = require('assert');
const { ModelMapper, PropertyMap } = require('..');

class BaseModel {}
PropertyMap()(BaseModel.prototype, 'inherited');
class ChildModel extends BaseModel {}

const mapped = new ModelMapper(ChildModel).map({ inherited: 'from-package' });
assert.strictEqual(mapped.inherited, 'from-package');

class WithDefault {}
PropertyMap({ default: [] })(WithDefault.prototype, 'items');
const mapper = new ModelMapper(WithDefault);
const first = mapper.map({});
const second = mapper.map({});
first.items.push('first');
assert.deepStrictEqual(second.items, []);
