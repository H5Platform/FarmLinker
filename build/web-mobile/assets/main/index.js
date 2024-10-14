System.register("chunks:///_virtual/Animal.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './SharedDefines.ts', './AnimalDataManager.ts', './GameController.ts', './NetworkManager.ts', './GrowthableEntity.ts'], function (exports) {
  var _applyDecoratedDescriptor, _inheritsLoose, _initializerDefineProperty, _assertThisInitialized, _asyncToGenerator, _regeneratorRuntime, cclegacy, _decorator, director, Node, SharedDefines, GrowState, SceneItemState, CommandType, AnimalDataManager, GameController, NetworkManager, GrowthableEntity;
  return {
    setters: [function (module) {
      _applyDecoratedDescriptor = module.applyDecoratedDescriptor;
      _inheritsLoose = module.inheritsLoose;
      _initializerDefineProperty = module.initializerDefineProperty;
      _assertThisInitialized = module.assertThisInitialized;
      _asyncToGenerator = module.asyncToGenerator;
      _regeneratorRuntime = module.regeneratorRuntime;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      director = module.director;
      Node = module.Node;
    }, function (module) {
      SharedDefines = module.SharedDefines;
      GrowState = module.GrowState;
      SceneItemState = module.SceneItemState;
      CommandType = module.CommandType;
    }, function (module) {
      AnimalDataManager = module.AnimalDataManager;
    }, function (module) {
      GameController = module.GameController;
    }, function (module) {
      NetworkManager = module.NetworkManager;
    }, function (module) {
      GrowthableEntity = module.GrowthableEntity;
    }],
    execute: function () {
      var _dec, _class, _class2, _descriptor;
      cclegacy._RF.push({}, "f32a1G+n41M64bv1de0LOTm", "Animal", undefined);
      var ccclass = _decorator.ccclass,
        property = _decorator.property;
      var Animal = exports('Animal', (_dec = ccclass('Animal'), _dec(_class = (_class2 = /*#__PURE__*/function (_GrowthableEntity) {
        _inheritsLoose(Animal, _GrowthableEntity);
        function Animal() {
          var _this;
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          _this = _GrowthableEntity.call.apply(_GrowthableEntity, [this].concat(args)) || this;
          _initializerDefineProperty(_this, "animalType", _descriptor, _assertThisInitialized(_this));
          _this.gameController = void 0;
          _this.playerController = void 0;
          return _this;
        }
        var _proto = Animal.prototype;
        _proto.onLoad = function onLoad() {
          //find game controller by class
          this.gameController = director.getScene().getComponentInChildren(GameController);
          this.playerController = this.gameController.getPlayerController();
        };
        _proto.initialize = function initialize(id) {
          this.baseSpritePath = SharedDefines.ANIMALS_TEXTURES;
          this.loadEntityData(id);
          if (this.growthStages.length > 0) {
            this.setupData(this.growthStages[0]);
            // this.updateSprite(`${this.baseSpritePath}${this.growthStages[0].png}`);
          } else {
            console.error("No growth stages found for animal with id: " + id);
          }
        };
        _proto.initializeWithSceneItem = function initializeWithSceneItem(sceneItem, isPlayerOwner) {
          this.baseSpritePath = SharedDefines.ANIMALS_TEXTURES;
          _GrowthableEntity.prototype.initializeWithSceneItem.call(this, sceneItem, isPlayerOwner);
        };
        _proto.loadEntityData = function loadEntityData(id) {
          var baseAnimalData = AnimalDataManager.instance.findAnimalDataById(id);
          if (!baseAnimalData) {
            console.error("No animal data found for id: " + id);
            return;
          }
          var animalType = baseAnimalData.animal_type;
          this.growthStages = AnimalDataManager.instance.filterAnimalDataByAnimalType(animalType);
        };
        _proto.setupData = function setupData(animalData) {
          this.id = animalData.id;
          this.description = animalData.description;
          this.growthTime = parseInt(animalData.time_min) * SharedDefines.TIME_MINUTE;
          this.harvestItemId = animalData.harvest_item_id;
          this.farmType = animalData.farm_type;
          this.timeMin = parseInt(animalData.time_min);
          this.levelNeed = parseInt(animalData.level_need);
        };
        _proto.canHarvest = function canHarvest() {
          return (this.growState == GrowState.HARVESTING || this.sceneItem.state == SceneItemState.Dead) && this.harvestItemId != "" && this.isPlayerOwner;
        };
        _proto.harvest = /*#__PURE__*/function () {
          var _harvest = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee() {
            var result;
            return _regeneratorRuntime().wrap(function _callee$(_context) {
              while (1) switch (_context.prev = _context.next) {
                case 0:
                  if (this.canHarvest()) {
                    _context.next = 3;
                    break;
                  }
                  console.error("Animal " + this.node.name + " is not ready to harvest");
                  return _context.abrupt("return");
                case 3:
                  _context.next = 5;
                  return NetworkManager.instance.harvest(this.sceneItem.id, this.sceneItem.item_id, this.sceneItem.type);
                case 5:
                  result = _context.sent;
                  if (!result) {
                    _context.next = 15;
                    break;
                  }
                  this.growState = GrowState.NONE;
                  this.eventTarget.emit(SharedDefines.EVENT_ANIMAL_HARVEST, this);
                  this.node.off(Node.EventType.TOUCH_END, this.harvest, this);
                  this.stopDiseaseStatusUpdates();
                  this.node.destroy();
                  return _context.abrupt("return");
                case 15:
                  console.error("Animal " + this.node.name + " harvest failed");
                  return _context.abrupt("return");
                case 17:
                case "end":
                  return _context.stop();
              }
            }, _callee, this);
          }));
          function harvest() {
            return _harvest.apply(this, arguments);
          }
          return harvest;
        }() // Any additional Animal-specific methods can be added here
        ;

        _proto.canPerformOperation = function canPerformOperation(operation) {
          switch (operation) {
            case CommandType.Care:
              return this.canCare();
            case CommandType.Treat:
              return this.canTreat();
            case CommandType.Cleanse:
              return this.canCleanse();
            default:
              return false;
          }
        };
        _proto.performOperation = /*#__PURE__*/function () {
          var _performOperation = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2(operation) {
            var sceneItem, result;
            return _regeneratorRuntime().wrap(function _callee2$(_context2) {
              while (1) switch (_context2.prev = _context2.next) {
                case 0:
                  sceneItem = this.SceneItem;
                  if (sceneItem) {
                    _context2.next = 3;
                    break;
                  }
                  return _context2.abrupt("return");
                case 3:
                  result = null;
                  _context2.t0 = operation;
                  _context2.next = _context2.t0 === CommandType.Care ? 7 : _context2.t0 === CommandType.Treat ? 12 : _context2.t0 === CommandType.Cleanse ? 17 : 22;
                  break;
                case 7:
                  _context2.next = 9;
                  return NetworkManager.instance.care(sceneItem.id);
                case 9:
                  result = _context2.sent;
                  if (result && result.success) {
                    this.CareCount = result.data.care_count;
                  }
                  return _context2.abrupt("break", 22);
                case 12:
                  _context2.next = 14;
                  return NetworkManager.instance.treat(sceneItem.id);
                case 14:
                  result = _context2.sent;
                  if (result && result.success) {
                    this.TreatCount = result.data.treat_count;
                  }
                  return _context2.abrupt("break", 22);
                case 17:
                  _context2.next = 19;
                  return NetworkManager.instance.cleanse(sceneItem.id);
                case 19:
                  result = _context2.sent;
                  if (result && result.success) ;
                  return _context2.abrupt("break", 22);
                case 22:
                  if (result && result.success && result.data.friend_id) {
                    console.log("Operation " + operation + " on friend's animal, friend_id = " + result.data.friend_id + ", diamond_added = " + result.data.diamond_added);
                    this.playerController.playerState.addDiamond(result.data.diamond_added);
                    this.playerController.friendState.addDiamond(result.data.diamond_added);
                  }
                case 23:
                case "end":
                  return _context2.stop();
              }
            }, _callee2, this);
          }));
          function performOperation(_x) {
            return _performOperation.apply(this, arguments);
          }
          return performOperation;
        }();
        _proto.canCare = function canCare() {
          //log all variables
          console.log("canCare: " + this.sceneItem.state + " " + this.CareCount + " " + this.lastCareTime + " " + SharedDefines.CARE_COOLDOWN + " " + Date.now() / 1000);
          return this.sceneItem.state !== SceneItemState.Dead && this.CareCount < SharedDefines.MAX_ANIMAL_CARE_COUNT && this.lastCareTime + SharedDefines.CARE_COOLDOWN < Date.now() / 1000;
        };
        _proto.canTreat = function canTreat() {
          return this.sceneItem.state !== SceneItemState.Dead && this.TreatCount < SharedDefines.MAX_ANIMAL_TREAT_COUNT && this.lastTreatTime + SharedDefines.TREAT_COOLDOWN < Date.now() / 1000;
        };
        _proto.canCleanse = function canCleanse() {
          return this.sceneItem.state !== SceneItemState.Dead && this.CleanseCount < SharedDefines.MAX_ANIMAL_CLEANSE_COUNT && this.lastCleanseTime + SharedDefines.CLEANSE_COOLDOWN < Date.now() / 1000;
        };
        _proto.care = /*#__PURE__*/function () {
          var _care = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee3() {
            var result;
            return _regeneratorRuntime().wrap(function _callee3$(_context3) {
              while (1) switch (_context3.prev = _context3.next) {
                case 0:
                  result = null; //check friendId is valid
                  _context3.next = 3;
                  return NetworkManager.instance.care(this.sceneItem.id);
                case 3:
                  result = _context3.sent;
                  if (result && result.success) {
                    this.CareCount = result.data.care_count;
                    this.lastCareTime = Date.now() / 1000;
                  }
                  return _context3.abrupt("return", result);
                case 6:
                case "end":
                  return _context3.stop();
              }
            }, _callee3, this);
          }));
          function care() {
            return _care.apply(this, arguments);
          }
          return care;
        }();
        _proto.careByFriend = /*#__PURE__*/function () {
          var _careByFriend = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee4(friendId) {
            var result;
            return _regeneratorRuntime().wrap(function _callee4$(_context4) {
              while (1) switch (_context4.prev = _context4.next) {
                case 0:
                  result = null; //check friendId is valid
                  _context4.next = 3;
                  return NetworkManager.instance.careFriend(this.sceneItem.id, friendId);
                case 3:
                  result = _context4.sent;
                  if (result && result.success) {
                    this.CareCount = result.data.care_count;
                    this.lastCareTime = Date.now() / 1000;
                  }
                  return _context4.abrupt("return", result);
                case 6:
                case "end":
                  return _context4.stop();
              }
            }, _callee4, this);
          }));
          function careByFriend(_x2) {
            return _careByFriend.apply(this, arguments);
          }
          return careByFriend;
        }();
        _proto.treat = /*#__PURE__*/function () {
          var _treat = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee5() {
            var result;
            return _regeneratorRuntime().wrap(function _callee5$(_context5) {
              while (1) switch (_context5.prev = _context5.next) {
                case 0:
                  result = null; //check friendId is valid
                  _context5.next = 3;
                  return NetworkManager.instance.treat(this.sceneItem.id);
                case 3:
                  result = _context5.sent;
                  if (result && result.success) {
                    this.TreatCount = result.data.treat_count;
                    this.lastTreatTime = Date.now() / 1000;
                  }
                  return _context5.abrupt("return", result);
                case 6:
                case "end":
                  return _context5.stop();
              }
            }, _callee5, this);
          }));
          function treat() {
            return _treat.apply(this, arguments);
          }
          return treat;
        }();
        _proto.treatByFriend = /*#__PURE__*/function () {
          var _treatByFriend = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee6(friendId) {
            var result;
            return _regeneratorRuntime().wrap(function _callee6$(_context6) {
              while (1) switch (_context6.prev = _context6.next) {
                case 0:
                  result = null; //check friendId is valid
                  _context6.next = 3;
                  return NetworkManager.instance.treatFriend(this.sceneItem.id, friendId);
                case 3:
                  result = _context6.sent;
                  if (result && result.success) {
                    this.TreatCount = result.data.treat_count;
                    this.lastTreatTime = Date.now() / 1000;
                  }
                  return _context6.abrupt("return", result);
                case 6:
                case "end":
                  return _context6.stop();
              }
            }, _callee6, this);
          }));
          function treatByFriend(_x3) {
            return _treatByFriend.apply(this, arguments);
          }
          return treatByFriend;
        }();
        _proto.cleanse = /*#__PURE__*/function () {
          var _cleanse = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee7() {
            var result;
            return _regeneratorRuntime().wrap(function _callee7$(_context7) {
              while (1) switch (_context7.prev = _context7.next) {
                case 0:
                  result = null; //check friendId is valid
                  _context7.next = 3;
                  return NetworkManager.instance.cleanse(this.sceneItem.id);
                case 3:
                  result = _context7.sent;
                  if (result && result.success) {
                    this.CleanseCount = result.data.cleanse_count;
                    this.lastCleanseTime = Date.now() / 1000;
                  }
                  return _context7.abrupt("return", result);
                case 6:
                case "end":
                  return _context7.stop();
              }
            }, _callee7, this);
          }));
          function cleanse() {
            return _cleanse.apply(this, arguments);
          }
          return cleanse;
        }();
        _proto.cleanseByFriend = /*#__PURE__*/function () {
          var _cleanseByFriend = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee8(friendId) {
            var result;
            return _regeneratorRuntime().wrap(function _callee8$(_context8) {
              while (1) switch (_context8.prev = _context8.next) {
                case 0:
                  result = null; //check friendId is valid
                  _context8.next = 3;
                  return NetworkManager.instance.cleanseFriend(this.sceneItem.id, friendId);
                case 3:
                  result = _context8.sent;
                  if (result && result.success) {
                    this.CleanseCount = result.data.cleanse_count;
                    this.lastCleanseTime = Date.now() / 1000;
                  }
                  return _context8.abrupt("return", result);
                case 6:
                case "end":
                  return _context8.stop();
              }
            }, _callee8, this);
          }));
          function cleanseByFriend(_x4) {
            return _cleanseByFriend.apply(this, arguments);
          }
          return cleanseByFriend;
        }();
        return Animal;
      }(GrowthableEntity), _descriptor = _applyDecoratedDescriptor(_class2.prototype, "animalType", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return '';
        }
      }), _class2)) || _class));
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/AnimalDataManager.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './SharedDefines.ts'], function (exports) {
  var _createClass, _asyncToGenerator, _regeneratorRuntime, cclegacy, resources, JsonAsset, SharedDefines;
  return {
    setters: [function (module) {
      _createClass = module.createClass;
      _asyncToGenerator = module.asyncToGenerator;
      _regeneratorRuntime = module.regeneratorRuntime;
    }, function (module) {
      cclegacy = module.cclegacy;
      resources = module.resources;
      JsonAsset = module.JsonAsset;
    }, function (module) {
      SharedDefines = module.SharedDefines;
    }],
    execute: function () {
      cclegacy._RF.push({}, "ba8e1RcalRFVLNyvJIyInOS", "AnimalDataManager", undefined);
      var AnimalDataManager = exports('AnimalDataManager', /*#__PURE__*/function () {
        function AnimalDataManager() {
          this.animalDataList = [];
        }
        var _proto = AnimalDataManager.prototype;
        _proto.loadAnimalData = /*#__PURE__*/function () {
          var _loadAnimalData = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee() {
            var _this = this;
            return _regeneratorRuntime().wrap(function _callee$(_context) {
              while (1) switch (_context.prev = _context.next) {
                case 0:
                  return _context.abrupt("return", new Promise(function (resolve, reject) {
                    resources.load(SharedDefines.JSON_ANIMAL_DATA, JsonAsset, function (err, jsonAsset) {
                      if (err) {
                        console.error('Failed to load AnimalData:', err);
                        reject(err);
                        return;
                      }
                      _this.animalDataList = jsonAsset.json.list;
                      resolve();
                    });
                  }));
                case 1:
                case "end":
                  return _context.stop();
              }
            }, _callee);
          }));
          function loadAnimalData() {
            return _loadAnimalData.apply(this, arguments);
          }
          return loadAnimalData;
        }();
        _proto.findAnimalDataById = function findAnimalDataById(id) {
          return this.animalDataList.find(function (animal) {
            return animal.id === id;
          });
        };
        _proto.findAnimalDataByName = function findAnimalDataByName(name) {
          return this.animalDataList.find(function (animal) {
            return animal.name === name;
          });
        };
        _proto.filterAnimalDataByAnimalType = function filterAnimalDataByAnimalType(cropType) {
          return this.animalDataList.filter(function (crop) {
            return crop.animal_type === cropType;
          });
        };
        _proto.filterAnimalDataByFarmType = function filterAnimalDataByFarmType(farmType) {
          return this.animalDataList.filter(function (animal) {
            return animal.farm_type === farmType;
          });
        };
        _proto.filterAnimalDataByMaxLevel = function filterAnimalDataByMaxLevel(maxLevel) {
          return this.animalDataList.filter(function (animal) {
            return parseInt(animal.level_need) <= maxLevel;
          });
        };
        _proto.getAllAnimalData = function getAllAnimalData() {
          return [].concat(this.animalDataList);
        };
        _proto.getAnimalDataCount = function getAnimalDataCount() {
          return this.animalDataList.length;
        };
        _proto.isAnimalDataLoaded = function isAnimalDataLoaded() {
          return this.animalDataList.length > 0;
        };
        _createClass(AnimalDataManager, null, [{
          key: "instance",
          get: function get() {
            if (this._instance === null) {
              this._instance = new AnimalDataManager();
            }
            return this._instance;
          }
        }]);
        return AnimalDataManager;
      }());
      AnimalDataManager._instance = null;
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/BuildDataManager.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './SharedDefines.ts'], function (exports) {
  var _createClass, _asyncToGenerator, _regeneratorRuntime, cclegacy, resources, JsonAsset, SharedDefines;
  return {
    setters: [function (module) {
      _createClass = module.createClass;
      _asyncToGenerator = module.asyncToGenerator;
      _regeneratorRuntime = module.regeneratorRuntime;
    }, function (module) {
      cclegacy = module.cclegacy;
      resources = module.resources;
      JsonAsset = module.JsonAsset;
    }, function (module) {
      SharedDefines = module.SharedDefines;
    }],
    execute: function () {
      cclegacy._RF.push({}, "38f41AH+TRDz4vgiC1HLVIQ", "BuildDataManager", undefined);
      var BuildDataManager = exports('BuildDataManager', /*#__PURE__*/function () {
        function BuildDataManager() {
          this.buildDataList = [];
        }
        var _proto = BuildDataManager.prototype;
        _proto.loadBuildData = /*#__PURE__*/function () {
          var _loadBuildData = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee() {
            var _this = this;
            return _regeneratorRuntime().wrap(function _callee$(_context) {
              while (1) switch (_context.prev = _context.next) {
                case 0:
                  return _context.abrupt("return", new Promise(function (resolve, reject) {
                    resources.load(SharedDefines.JSON_BUILD_DATA, JsonAsset, function (err, jsonAsset) {
                      if (err) {
                        console.error('Failed to load BuildData:', err);
                        reject(err);
                        return;
                      }
                      _this.buildDataList = jsonAsset.json.list;
                      resolve();
                    });
                  }));
                case 1:
                case "end":
                  return _context.stop();
              }
            }, _callee);
          }));
          function loadBuildData() {
            return _loadBuildData.apply(this, arguments);
          }
          return loadBuildData;
        }();
        _proto.findBuildDataById = function findBuildDataById(id) {
          return this.buildDataList.find(function (build) {
            return build.id === id;
          });
        };
        _proto.findBuildDataByName = function findBuildDataByName(name) {
          return this.buildDataList.find(function (build) {
            return build.name === name;
          });
        };
        _proto.filterBuildDataByLevelRequirement = function filterBuildDataByLevelRequirement(level) {
          return this.buildDataList.filter(function (build) {
            return parseInt(build.level_need) <= level;
          });
        };
        _proto.getAllBuildData = function getAllBuildData() {
          return [].concat(this.buildDataList);
        };
        _proto.getBuildDataCount = function getBuildDataCount() {
          return this.buildDataList.length;
        };
        _proto.isBuildDataLoaded = function isBuildDataLoaded() {
          return this.buildDataList.length > 0;
        };
        _createClass(BuildDataManager, null, [{
          key: "instance",
          get: function get() {
            if (this._instance === null) {
              this._instance = new BuildDataManager();
            }
            return this._instance;
          }
        }]);
        return BuildDataManager;
      }());
      BuildDataManager._instance = null;
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/Building.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './ResourceManager.ts', './SharedDefines.ts', './BuildDataManager.ts'], function (exports) {
  var _applyDecoratedDescriptor, _inheritsLoose, _initializerDefineProperty, _assertThisInitialized, _createClass, _asyncToGenerator, _regeneratorRuntime, cclegacy, _decorator, EventTarget, Sprite, UITransform, BoxCollider2D, Size, Component, SpriteFrame, ResourceManager, BuildingType, SceneItemState, SharedDefines, BuildDataManager;
  return {
    setters: [function (module) {
      _applyDecoratedDescriptor = module.applyDecoratedDescriptor;
      _inheritsLoose = module.inheritsLoose;
      _initializerDefineProperty = module.initializerDefineProperty;
      _assertThisInitialized = module.assertThisInitialized;
      _createClass = module.createClass;
      _asyncToGenerator = module.asyncToGenerator;
      _regeneratorRuntime = module.regeneratorRuntime;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      EventTarget = module.EventTarget;
      Sprite = module.Sprite;
      UITransform = module.UITransform;
      BoxCollider2D = module.BoxCollider2D;
      Size = module.Size;
      Component = module.Component;
      SpriteFrame = module.SpriteFrame;
    }, function (module) {
      ResourceManager = module.ResourceManager;
    }, function (module) {
      BuildingType = module.BuildingType;
      SceneItemState = module.SceneItemState;
      SharedDefines = module.SharedDefines;
    }, function (module) {
      BuildDataManager = module.BuildDataManager;
    }],
    execute: function () {
      var _dec, _class, _class2, _descriptor, _descriptor2, _class3;
      cclegacy._RF.push({}, "61831+EkDNPRoO0fnfBmq/J", "Building", undefined);
      var ccclass = _decorator.ccclass,
        property = _decorator.property;
      var BuildingState = exports('BuildingState', /*#__PURE__*/function (BuildingState) {
        BuildingState[BuildingState["NONE"] = 0] = "NONE";
        BuildingState[BuildingState["CONSTRUCTING"] = 1] = "CONSTRUCTING";
        BuildingState[BuildingState["COMPLETED"] = 2] = "COMPLETED";
        return BuildingState;
      }({}));
      var Building = exports('Building', (_dec = ccclass('Building'), _dec(_class = (_class2 = (_class3 = /*#__PURE__*/function (_Component) {
        _inheritsLoose(Building, _Component);
        function Building() {
          var _this;
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          _this = _Component.call.apply(_Component, [this].concat(args)) || this;
          _initializerDefineProperty(_this, "id", _descriptor, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "level", _descriptor2, _assertThisInitialized(_this));
          _this.sprite = null;
          _this.buildingData = void 0;
          _this.sceneItem = null;
          _this.buildingType = BuildingType.None;
          _this.state = BuildingState.NONE;
          _this.arrowContainer = null;
          _this.eventTarget = new EventTarget();
          _this.spriteCache = new Map();
          return _this;
        }
        var _proto = Building.prototype;
        _proto.initialize = function initialize(buildingData) {
          this.arrowContainer = this.node.getChildByName("Arrows");
          this.arrowContainer.active = false;
          this.sprite = this.getComponent(Sprite);
          this.buildingData = buildingData;
          this.id = buildingData.id;
          this.updateSprite();
          this.setState(BuildingState.CONSTRUCTING);
          this.buildingType = buildingData.item_type;
        };
        _proto.initializeFromSceneItem = function initializeFromSceneItem(sceneItem) {
          console.log("Building initializeFromSceneItem start");
          this.id = sceneItem.item_id;
          this.node.name = this.id;
          this.sceneItem = sceneItem;
          this.buildingData = BuildDataManager.instance.findBuildDataById(this.id);
          if (!this.buildingData) {
            console.error("Building data not found for id: " + this.id);
            return;
          }
          this.initialize(this.buildingData);
          console.log("sceneItem", sceneItem);
          //update state
          if (sceneItem.state === SceneItemState.Complete) {
            this.setState(BuildingState.COMPLETED);
          } else if (sceneItem.state === SceneItemState.InProgress) {
            this.setState(BuildingState.CONSTRUCTING);
          }
        };
        _proto.updateSprite = /*#__PURE__*/function () {
          var _updateSprite = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee() {
            var spriteFrame;
            return _regeneratorRuntime().wrap(function _callee$(_context) {
              while (1) switch (_context.prev = _context.next) {
                case 0:
                  if (!(this.sprite && this.buildingData.texture)) {
                    _context.next = 8;
                    break;
                  }
                  spriteFrame = this.spriteCache.get(this.buildingData.texture);
                  if (spriteFrame) {
                    _context.next = 7;
                    break;
                  }
                  _context.next = 5;
                  return ResourceManager.instance.loadAsset("" + SharedDefines.WINDOW_BUILDING_TEXTURES + this.buildingData.texture + "/spriteFrame", SpriteFrame);
                case 5:
                  spriteFrame = _context.sent;
                  if (spriteFrame) {
                    this.spriteCache.set(this.buildingData.texture, spriteFrame);
                  }
                case 7:
                  if (spriteFrame) {
                    this.sprite.spriteFrame = spriteFrame;
                    this.updateCollider();
                  }
                case 8:
                case "end":
                  return _context.stop();
              }
            }, _callee, this);
          }));
          function updateSprite() {
            return _updateSprite.apply(this, arguments);
          }
          return updateSprite;
        }();
        _proto.updateCollider = function updateCollider() {
          var uiTransform = this.node.getComponent(UITransform);
          var collider = this.node.getComponent(BoxCollider2D);
          if (collider) {
            var size = uiTransform.contentSize;
            collider.size = new Size(size.width * 0.7, size.height * 0.7);
          }
        };
        _proto.setSprite = function setSprite(sprite) {
          this.sprite = sprite;
        };
        _proto.setState = function setState(newState) {
          if (this.state !== newState) {
            console.log("Building setState to " + newState);
            var oldState = this.state;
            this.state = newState;
            this.eventTarget.emit(Building.EVENT_STATE_CHANGED, {
              oldState: oldState,
              newState: newState
            });
          }
        };
        _proto.getState = function getState() {
          return this.state;
        };
        _proto.completeConstruction = /*#__PURE__*/function () {
          var _completeConstruction = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2() {
            return _regeneratorRuntime().wrap(function _callee2$(_context2) {
              while (1) switch (_context2.prev = _context2.next) {
                case 0:
                  this.setState(BuildingState.COMPLETED);
                case 1:
                case "end":
                  return _context2.stop();
              }
            }, _callee2, this);
          }));
          function completeConstruction() {
            return _completeConstruction.apply(this, arguments);
          }
          return completeConstruction;
        }() // 预留升级方法
        ;

        _proto.upgrade = function upgrade(playerState) {
          // 这里可以添加升级逻辑，比如检查资源是否足够，是否满足升级条件等
          // 目前简单地增加等级
          this.level++;
          this.eventTarget.emit(Building.EVENT_LEVEL_UP, this.level);
          return true;
        }

        // // 预留销毁方法
        // public destroy(): void {
        //     // 这里可以添加销毁前的逻辑，比如返还部分资源等
        //     super.destroy();
        // }

        // 预留选中方法
        ;

        _proto.select = function select() {
          // 这里可以添加选中建筑时的逻辑
          console.log("Building " + this.name + " selected");
        }

        // 预留取消选中方法
        ;

        _proto.deselect = function deselect() {
          // 这里可以添加取消选中建筑时的逻辑
          console.log("Building " + this.name + " deselected");
        };
        _createClass(Building, [{
          key: "BuildingData",
          get:
          //getter buidingData
          function get() {
            return this.buildingData;
          }
        }, {
          key: "isFactory",
          get:
          //getter isFactory
          function get() {
            return this.buildingType == BuildingType.Factory;
          }
          //getter
        }, {
          key: "SceneItem",
          get: function get() {
            return this.sceneItem;
          }
        }]);
        return Building;
      }(Component), _class3.EVENT_STATE_CHANGED = 'building-state-changed', _class3.EVENT_LEVEL_UP = 'building-level-up', _class3), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "id", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return '';
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "level", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 1;
        }
      })), _class2)) || _class));
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/BuildingManager.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc'], function (exports) {
  var _inheritsLoose, _createClass, cclegacy, _decorator, Component;
  return {
    setters: [function (module) {
      _inheritsLoose = module.inheritsLoose;
      _createClass = module.createClass;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      Component = module.Component;
    }],
    execute: function () {
      var _dec, _class, _class2;
      cclegacy._RF.push({}, "a3120+sV6lEbZziWW57QgDd", "BuildingManager", undefined);
      var ccclass = _decorator.ccclass,
        property = _decorator.property;
      var BuildingManager = exports('BuildingManager', (_dec = ccclass('BuildingManager'), _dec(_class = (_class2 = /*#__PURE__*/function (_Component) {
        _inheritsLoose(BuildingManager, _Component);
        function BuildingManager() {
          var _this;
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          _this = _Component.call.apply(_Component, [this].concat(args)) || this;
          _this.buildings = new Map();
          return _this;
        }
        var _proto = BuildingManager.prototype;
        _proto.addBuilding = function addBuilding(buildingId, buildingNode) {
          this.buildings.set(buildingId, buildingNode);
        };
        _proto.hasBuildingOfType = function hasBuildingOfType(buildingId) {
          return this.buildings.has(buildingId);
        };
        _proto.focusOnBuilding = function focusOnBuilding(buildingId) {
          var building = this.buildings.get(buildingId);
          if (building) {
            // 实现相机聚焦逻辑
            // 这里需要根据您的相机系统进行适当的实现
            console.log("Focusing on building: " + buildingId);
          }
        };
        _proto.getBuildingPosition = function getBuildingPosition(buildingId) {
          var building = this.buildings.get(buildingId);
          return building ? building.worldPosition : null;
        };
        _createClass(BuildingManager, null, [{
          key: "instance",
          get: function get() {
            if (this._instance === null) {
              this._instance = new BuildingManager();
            }
            return this._instance;
          }
        }]);
        return BuildingManager;
      }(Component), _class2._instance = null, _class2)) || _class));
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/BuildingPlacementComponent.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './SharedDefines.ts', './ResourceManager.ts', './Building.ts', './NetworkManager.ts', './SpriteHelper.ts', './GameController.ts'], function (exports) {
  var _inheritsLoose, _asyncToGenerator, _regeneratorRuntime, cclegacy, _decorator, RigidBody2D, Collider2D, Contact2DType, Color, Director, Camera, Sprite, Vec3, SpriteFrame, UITransform, BoxCollider2D, Size, Component, Vec2, SharedDefines, ResourceManager, Building, NetworkManager, SpriteHelper, GameController;
  return {
    setters: [function (module) {
      _inheritsLoose = module.inheritsLoose;
      _asyncToGenerator = module.asyncToGenerator;
      _regeneratorRuntime = module.regeneratorRuntime;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      RigidBody2D = module.RigidBody2D;
      Collider2D = module.Collider2D;
      Contact2DType = module.Contact2DType;
      Color = module.Color;
      Director = module.Director;
      Camera = module.Camera;
      Sprite = module.Sprite;
      Vec3 = module.Vec3;
      SpriteFrame = module.SpriteFrame;
      UITransform = module.UITransform;
      BoxCollider2D = module.BoxCollider2D;
      Size = module.Size;
      Component = module.Component;
      Vec2 = module.Vec2;
    }, function (module) {
      SharedDefines = module.SharedDefines;
    }, function (module) {
      ResourceManager = module.ResourceManager;
    }, function (module) {
      Building = module.Building;
    }, function (module) {
      NetworkManager = module.NetworkManager;
    }, function (module) {
      SpriteHelper = module.SpriteHelper;
    }, function (module) {
      GameController = module.GameController;
    }],
    execute: function () {
      var _dec, _class;
      cclegacy._RF.push({}, "de5359MGmBIoaJz/g7rdEVM", "BuildingPlacementComponent", undefined);
      var ccclass = _decorator.ccclass,
        property = _decorator.property;
      var BuildingPlacementComponent = exports('BuildingPlacementComponent', (_dec = ccclass('BuildingPlacementComponent'), _dec(_class = /*#__PURE__*/function (_Component) {
        _inheritsLoose(BuildingPlacementComponent, _Component);
        function BuildingPlacementComponent() {
          var _this;
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          _this = _Component.call.apply(_Component, [this].concat(args)) || this;
          _this.buildData = void 0;
          _this.buildingManager = null;
          _this.isPlacing = false;
          _this.camera = null;
          _this.buildingSprite = null;
          _this.collider = null;
          _this.contactCount = 0;
          _this.isIntersecting = false;
          _this.debugDraw = null;
          return _this;
        }
        var _proto = BuildingPlacementComponent.prototype;
        _proto.onEnable = function onEnable() {
          //get rigidbody
          var rigidbody = this.node.getComponent(RigidBody2D);
          if (rigidbody) {
            rigidbody.enabledContactListener = true;
          }
          this.collider = this.node.getComponent(Collider2D);
          if (this.collider) {
            this.collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
            this.collider.on(Contact2DType.END_CONTACT, this.onEndContact, this);
          }
        };
        _proto.onDisable = function onDisable() {
          var rigidbody = this.node.getComponent(RigidBody2D);
          if (rigidbody) {
            rigidbody.enabledContactListener = false;
          }
          if (this.collider) {
            this.collider.off(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
            this.collider.off(Contact2DType.END_CONTACT, this.onEndContact, this);
          }
        };
        _proto.onBeginContact = function onBeginContact(selfCollider, otherCollider, contact) {
          this.contactCount++;
          SpriteHelper.setSpriteColor(this.buildingSprite, new Color(255, 0, 0, 125));
          console.log("onBeginContact self: " + this.node.name + ", other: " + otherCollider.node.name + ", contact count: " + this.contactCount);
        };
        _proto.onEndContact = function onEndContact(selfCollider, otherCollider, contact) {
          this.contactCount--;
          if (this.contactCount === 0) {
            SpriteHelper.setSpriteColor(this.buildingSprite, new Color(255, 255, 255, 125));
          }
          console.log("onEndContact self: " + this.node.name + ", other: " + otherCollider.node.name + ", contact count: " + this.contactCount);
        };
        _proto.initialize = function initialize(buildData, buildingManager) {
          this.node.name = buildData.id;
          this.buildData = buildData;
          this.buildingManager = buildingManager;
          var cameraNode = Director.instance.getScene().getChildByPath(SharedDefines.PATH_CAMERA);
          if (cameraNode) {
            this.camera = cameraNode.getComponent(Camera);
          } else {
            console.error("Cannot find camera node");
            return;
          }
          this.buildingSprite = this.node.getComponent(Sprite);
          this.updateBuildingAppearance();
        };
        _proto.onTouchStart = function onTouchStart(event) {
          this.isPlacing = true;
          var uiLocation = event.getLocation();
          this.updateBuildingPosition(new Vec3(uiLocation.x, uiLocation.y, 0));
        };
        _proto.onTouchMove = function onTouchMove(event) {
          if (this.isPlacing) {
            var uiLocation = event.getLocation();
            this.updateBuildingPosition(new Vec3(uiLocation.x, uiLocation.y, 0));
          }
        };
        _proto.updateBuildingPosition = function updateBuildingPosition(uiPos) {
          var worldPos = this.camera.screenToWorld(uiPos); //this.getWorldPositionFromUI(uiPos);
          if (worldPos) {
            this.node.setWorldPosition(worldPos);
          }
        };
        _proto.updateBuildingAppearance = function updateBuildingAppearance() {
          var _this2 = this;
          console.log("BuildingPlacementComponent.updateBuildingAppearance start .. pending texture = " + this.buildData.texture);
          ResourceManager.instance.loadAsset("" + SharedDefines.WINDOW_BUILDING_TEXTURES + this.buildData.texture + "/spriteFrame", SpriteFrame).then(function (spriteFrame) {
            _this2.buildingSprite.spriteFrame = spriteFrame;
            var uiTransform = _this2.node.getComponent(UITransform);
            //update collider box size
            var collider = _this2.node.getComponent(BoxCollider2D);
            if (collider) {
              var size = uiTransform.contentSize;
              collider.size = new Size(size.width * 0.7, size.height * 0.7);
            }
          });
        };
        _proto.canPlaceBuilding = function canPlaceBuilding() {
          return this.contactCount === 0;
        };
        _proto.placeBuilding = /*#__PURE__*/function () {
          var _placeBuilding = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(callback) {
            var buildingComponent, buildingContainer, gameController, designPos, result;
            return _regeneratorRuntime().wrap(function _callee$(_context) {
              while (1) switch (_context.prev = _context.next) {
                case 0:
                  console.log("Place building");
                  SpriteHelper.setSpriteColor(this.buildingSprite, new Color(255, 255, 255, 255));
                  buildingComponent = this.node.addComponent(Building);
                  buildingContainer = Director.instance.getScene().getChildByPath(SharedDefines.PATH_BUILDINGS);
                  if (!buildingContainer) {
                    _context.next = 9;
                    break;
                  }
                  this.node.removeFromParent();
                  buildingContainer.addChild(this.node);
                  _context.next = 11;
                  break;
                case 9:
                  console.error('BuildingContainer not found, building will remain in current parent');
                  return _context.abrupt("return");
                case 11:
                  //get game controller
                  gameController = Director.instance.getScene().getComponentInChildren(GameController); //convert world pos to design pos   
                  designPos = new Vec2(this.node.getWorldPosition().x / gameController.ScreenScale.x, this.node.getWorldPosition().y / gameController.ScreenScale.y);
                  _context.next = 15;
                  return NetworkManager.instance.addBuilding(this.buildData.id, designPos.x, designPos.y, buildingContainer.name);
                case 15:
                  result = _context.sent;
                  console.log("add building result", result);
                  if (result.success) {
                    buildingComponent.initializeFromSceneItem(result.data.sceneItem);
                    // 完成建造
                    buildingComponent.completeConstruction();
                    console.log("add building success");
                    this.buildingManager.addBuilding(this.buildData.id, this.node);
                    this.isPlacing = false;
                    callback(result);
                    this.destroy();
                  }
                case 18:
                case "end":
                  return _context.stop();
              }
            }, _callee, this);
          }));
          function placeBuilding(_x) {
            return _placeBuilding.apply(this, arguments);
          }
          return placeBuilding;
        }();
        _proto.cancelPlacement = function cancelPlacement() {
          this.isPlacing = false;
          this.node.destroy();
        };
        _proto.finalizePlacement = function finalizePlacement() {
          if (this.isPlacing) {
            if (this.canPlaceBuilding()) {
              this.placeBuilding();
            } else {
              this.cancelPlacement();
            }
          }
        };
        return BuildingPlacementComponent;
      }(Component)) || _class));
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/CoinCollectionEffectComponent.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc'], function (exports) {
  var _applyDecoratedDescriptor, _inheritsLoose, _initializerDefineProperty, _assertThisInitialized, cclegacy, _decorator, Prefab, Vec3, instantiate, tween, Component;
  return {
    setters: [function (module) {
      _applyDecoratedDescriptor = module.applyDecoratedDescriptor;
      _inheritsLoose = module.inheritsLoose;
      _initializerDefineProperty = module.initializerDefineProperty;
      _assertThisInitialized = module.assertThisInitialized;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      Prefab = module.Prefab;
      Vec3 = module.Vec3;
      instantiate = module.instantiate;
      tween = module.tween;
      Component = module.Component;
    }],
    execute: function () {
      var _dec, _dec2, _dec3, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6;
      cclegacy._RF.push({}, "a2d775WJhFEEbhlDR4V1WFj", "CoinCollectionEffectComponent", undefined);
      var ccclass = _decorator.ccclass,
        property = _decorator.property;
      var CoinType = exports('CoinType', /*#__PURE__*/function (CoinType) {
        CoinType[CoinType["COIN"] = 0] = "COIN";
        CoinType[CoinType["DIAMOND"] = 1] = "DIAMOND";
        return CoinType;
      }({}));
      var CoinCollectionEffectComponent = exports('CoinCollectionEffectComponent', (_dec = ccclass('CoinCollectionEffectComponent'), _dec2 = property(Prefab), _dec3 = property(Prefab), _dec(_class = (_class2 = /*#__PURE__*/function (_Component) {
        _inheritsLoose(CoinCollectionEffectComponent, _Component);
        function CoinCollectionEffectComponent() {
          var _this;
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          _this = _Component.call.apply(_Component, [this].concat(args)) || this;
          _initializerDefineProperty(_this, "coinPrefab", _descriptor, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "diamondPrefab", _descriptor2, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "coinCount", _descriptor3, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "spreadRadius", _descriptor4, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "moveDuration", _descriptor5, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "delayBetweenCoins", _descriptor6, _assertThisInitialized(_this));
          _this.targetPosition = new Vec3();
          _this.isPlaying = false;
          _this.targetPrefab = null;
          return _this;
        }
        var _proto = CoinCollectionEffectComponent.prototype;
        _proto.onLoad = function onLoad() {};
        _proto.setTargetPosition = function setTargetPosition(position) {
          this.targetPosition = position;
        };
        _proto.play = function play(coinType, startPosition, endPosition) {
          var _this2 = this;
          if (this.isPlaying) return;
          if (coinType === CoinType.COIN) {
            this.targetPrefab = this.coinPrefab;
          } else if (coinType === CoinType.DIAMOND) {
            this.targetPrefab = this.diamondPrefab;
          }
          if (!this.targetPrefab) {
            console.error("No target prefab set");
            return;
          }
          this.isPlaying = true;
          this.targetPosition = endPosition;
          for (var i = 0; i < this.coinCount; i++) {
            this.scheduleOnce(function () {
              return _this2.spawnCoin(startPosition);
            }, i * this.delayBetweenCoins);
          }
        };
        _proto.stop = function stop() {
          this.isPlaying = false;
          this.unscheduleAllCallbacks();
          this.node.removeAllChildren();
        };
        _proto.spawnCoin = function spawnCoin(startPosition) {
          var _this3 = this;
          var coin = instantiate(this.targetPrefab);
          coin.active = true;
          coin.parent = this.node;
          var randomOffset = new Vec3((Math.random() - 0.5) * 2 * this.spreadRadius, (Math.random() - 0.5) * 2 * this.spreadRadius, 0);
          coin.setWorldPosition(startPosition.add(randomOffset));
          tween(coin).to(this.moveDuration, {
            worldPosition: this.targetPosition
          }).call(function () {
            coin.removeFromParent();
            if (_this3.node.children.length === 1) {
              // Only the coinPrefab is left
              _this3.isPlaying = false;
              _this3.node.emit('effectComplete');
              _this3.node.destroy();
            }
          }).start();
        };
        return CoinCollectionEffectComponent;
      }(Component), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "coinPrefab", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "diamondPrefab", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "coinCount", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 10;
        }
      }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "spreadRadius", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 50;
        }
      }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "moveDuration", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 1;
        }
      }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "delayBetweenCoins", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 0.05;
        }
      })), _class2)) || _class));
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/CoinDisplay.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './CurrencyDisplayBase.ts', './SharedDefines.ts'], function (exports) {
  var _inheritsLoose, cclegacy, _decorator, CurrencyDisplayBase, SharedDefines;
  return {
    setters: [function (module) {
      _inheritsLoose = module.inheritsLoose;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
    }, function (module) {
      CurrencyDisplayBase = module.CurrencyDisplayBase;
    }, function (module) {
      SharedDefines = module.SharedDefines;
    }],
    execute: function () {
      var _dec, _class;
      cclegacy._RF.push({}, "fc5a2OtcTJFMrD++s+uNqe6", "CoinDisplay", undefined);
      var ccclass = _decorator.ccclass;
      var CoinDisplay = exports('CoinDisplay', (_dec = ccclass('CoinDisplay'), _dec(_class = /*#__PURE__*/function (_CurrencyDisplayBase) {
        _inheritsLoose(CoinDisplay, _CurrencyDisplayBase);
        function CoinDisplay() {
          var _this;
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          _this = _CurrencyDisplayBase.call.apply(_CurrencyDisplayBase, [this].concat(args)) || this;
          _this.eventName = SharedDefines.EVENT_PLAYER_GOLD_CHANGE;
          return _this;
        }
        var _proto = CoinDisplay.prototype;
        _proto.getCurrencyValue = function getCurrencyValue() {
          return this.playerState ? this.playerState.gold : 0;
        };
        _proto.addCurrency = function addCurrency(amount) {
          if (this.playerState) {
            this.playerState.addGold(amount);
          }
        };
        return CoinDisplay;
      }(CurrencyDisplayBase)) || _class));
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/CooldownComponent.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc'], function (exports) {
  var _inheritsLoose, cclegacy, _decorator, Component;
  return {
    setters: [function (module) {
      _inheritsLoose = module.inheritsLoose;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      Component = module.Component;
    }],
    execute: function () {
      var _dec, _class;
      cclegacy._RF.push({}, "55a10bXNBRBu74jk/OKxn/L", "CooldownComponent", undefined);
      var ccclass = _decorator.ccclass,
        property = _decorator.property;
      var CooldownComponent = exports('CooldownComponent', (_dec = ccclass('CooldownComponent'), _dec(_class = /*#__PURE__*/function (_Component) {
        _inheritsLoose(CooldownComponent, _Component);
        function CooldownComponent() {
          var _this;
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          _this = _Component.call.apply(_Component, [this].concat(args)) || this;
          _this.cooldowns = new Map();
          return _this;
        }
        var _proto = CooldownComponent.prototype;
        /**
         * Adds a new cooldown timer
         * @param key Unique identifier for the cooldown timer
         * @param duration Cooldown duration in seconds
         * @param callback Function to be called when the cooldown finishes
         */
        _proto.startCooldown = function startCooldown(key, duration, callback) {
          if (this.cooldowns.has(key)) {
            console.warn("Cooldown with key \"" + key + "\" already exists. Overwriting.");
          }
          console.log("Starting cooldown with key \"" + key + "\" for " + duration + " seconds");
          this.cooldowns.set(key, {
            remainingTime: duration,
            duration: duration,
            callback: callback
          });
        }

        /**
         * Removes a cooldown timer
         * @param key Identifier of the cooldown timer to remove
         */;
        _proto.removeCooldown = function removeCooldown(key) {
          this.cooldowns["delete"](key);
        }

        /**
         * Checks if a cooldown timer is currently active
         * @param key Identifier of the cooldown timer to check
         * @returns true if the cooldown is active, false otherwise
         */;
        _proto.isOnCooldown = function isOnCooldown(key) {
          return this.cooldowns.has(key);
        }

        /**
         * Gets the remaining time of a cooldown timer
         * @param key Identifier of the cooldown timer
         * @returns Remaining cooldown time in seconds. Returns 0 if the timer doesn't exist.
         */;
        _proto.getRemainingTime = function getRemainingTime(key) {
          var cooldown = this.cooldowns.get(key);
          return cooldown ? cooldown.remainingTime : 0;
        }

        /**
         * Gets the progress of a cooldown timer (value between 0 and 1)
         * @param key Identifier of the cooldown timer
         * @returns Cooldown progress. Returns 1 if the timer doesn't exist.
         */;
        _proto.getCooldownProgress = function getCooldownProgress(key) {
          var cooldown = this.cooldowns.get(key);
          if (!cooldown) return 1;
          return 1 - cooldown.remainingTime / cooldown.duration;
        };
        _proto.update = function update(dt) {
          var _this2 = this;
          this.cooldowns.forEach(function (timer, key) {
            timer.remainingTime -= dt;
            if (timer.remainingTime <= 0) {
              timer.callback();
              _this2.cooldowns["delete"](key);
            }
          });
        };
        return CooldownComponent;
      }(Component)) || _class));
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/CraftScrollViewItem.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './ResourceManager.ts', './SharedDefines.ts', './ScrollViewItem.ts'], function (exports) {
  var _applyDecoratedDescriptor, _inheritsLoose, _initializerDefineProperty, _assertThisInitialized, _asyncToGenerator, _regeneratorRuntime, cclegacy, _decorator, Label, Node, Sprite, Button, SpriteFrame, ResourceManager, SharedDefines, ScrollViewItem;
  return {
    setters: [function (module) {
      _applyDecoratedDescriptor = module.applyDecoratedDescriptor;
      _inheritsLoose = module.inheritsLoose;
      _initializerDefineProperty = module.initializerDefineProperty;
      _assertThisInitialized = module.assertThisInitialized;
      _asyncToGenerator = module.asyncToGenerator;
      _regeneratorRuntime = module.regeneratorRuntime;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      Label = module.Label;
      Node = module.Node;
      Sprite = module.Sprite;
      Button = module.Button;
      SpriteFrame = module.SpriteFrame;
    }, function (module) {
      ResourceManager = module.ResourceManager;
    }, function (module) {
      SharedDefines = module.SharedDefines;
    }, function (module) {
      ScrollViewItem = module.ScrollViewItem;
    }],
    execute: function () {
      var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6;
      cclegacy._RF.push({}, "5e4e2gI5YpI2bq36MMUWNp5", "CraftScrollViewItem", undefined);
      var ccclass = _decorator.ccclass,
        property = _decorator.property;
      var CraftScrollViewItem = exports('CraftScrollViewItem', (_dec = ccclass('CraftScrollViewItem'), _dec2 = property(Label), _dec3 = property(Label), _dec4 = property(Node), _dec5 = property(Label), _dec6 = property(Sprite), _dec7 = property(Button), _dec(_class = (_class2 = /*#__PURE__*/function (_ScrollViewItem) {
        _inheritsLoose(CraftScrollViewItem, _ScrollViewItem);
        function CraftScrollViewItem() {
          var _this;
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          _this = _ScrollViewItem.call.apply(_ScrollViewItem, [this].concat(args)) || this;
          _initializerDefineProperty(_this, "lbName", _descriptor, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "lbCoin", _descriptor2, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "diamondNode", _descriptor3, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "lbDiamond", _descriptor4, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "sprite", _descriptor5, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "button", _descriptor6, _assertThisInitialized(_this));
          _this.buildData = void 0;
          return _this;
        }
        var _proto = CraftScrollViewItem.prototype;
        _proto.initialize = function initialize(buildData, onClickCallback) {
          this.buildData = buildData;
          if (this.lbName) {
            this.lbName.string = buildData.description;
          }
          if (this.lbCoin) {
            this.lbCoin.string = buildData.cost_coin.toString();
          }
          if (this.diamondNode) {
            this.diamondNode.active = buildData.cost_diamond > 0;
          }
          if (this.lbDiamond) {
            this.lbDiamond.string = buildData.cost_diamond.toString();
          }
          this.loadSpriteFrame(buildData.texture);
          if (this.button) {
            this.button.node.on(Button.EventType.CLICK, function () {
              return onClickCallback(buildData);
            }, this);
          }
          this.node.name = buildData.id;
        };
        _proto.loadSpriteFrame = /*#__PURE__*/function () {
          var _loadSpriteFrame = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(iconName) {
            var spriteFrame;
            return _regeneratorRuntime().wrap(function _callee$(_context) {
              while (1) switch (_context.prev = _context.next) {
                case 0:
                  if (!this.sprite) {
                    _context.next = 5;
                    break;
                  }
                  _context.next = 3;
                  return ResourceManager.instance.loadAsset("" + SharedDefines.WINDOW_BUILDING_TEXTURES + iconName + "/spriteFrame", SpriteFrame);
                case 3:
                  spriteFrame = _context.sent;
                  if (spriteFrame) {
                    this.sprite.spriteFrame = spriteFrame;
                  }
                case 5:
                case "end":
                  return _context.stop();
              }
            }, _callee, this);
          }));
          function loadSpriteFrame(_x) {
            return _loadSpriteFrame.apply(this, arguments);
          }
          return loadSpriteFrame;
        }();
        _proto.setActive = function setActive(active) {
          this.node.active = active;
        };
        _proto.updateVisibilityByLevel = function updateVisibilityByLevel(playerLevel) {
          // console.log(`playerLevel: ${playerLevel}, required_level: ${this.buildData.level_need}`);
          this.setActive(playerLevel >= this.buildData.level_need);
        };
        return CraftScrollViewItem;
      }(ScrollViewItem), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "lbName", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "lbCoin", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "diamondNode", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "lbDiamond", [_dec5], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "sprite", [_dec6], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "button", [_dec7], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      })), _class2)) || _class));
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/CraftWindow.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './WindowBase.ts', './BuildDataManager.ts', './SharedDefines.ts', './WindowManager.ts', './CoinDisplay.ts', './DiamondDisplay.ts', './BuildingManager.ts', './CraftScrollViewItem.ts'], function (exports) {
  var _applyDecoratedDescriptor, _inheritsLoose, _initializerDefineProperty, _assertThisInitialized, _createForOfIteratorHelperLoose, _asyncToGenerator, _regeneratorRuntime, cclegacy, _decorator, Node, ScrollView, Button, instantiate, WindowBase, BuildDataManager, SharedDefines, WindowManager, CoinDisplay, DiamondDisplay, BuildingManager, CraftScrollViewItem;
  return {
    setters: [function (module) {
      _applyDecoratedDescriptor = module.applyDecoratedDescriptor;
      _inheritsLoose = module.inheritsLoose;
      _initializerDefineProperty = module.initializerDefineProperty;
      _assertThisInitialized = module.assertThisInitialized;
      _createForOfIteratorHelperLoose = module.createForOfIteratorHelperLoose;
      _asyncToGenerator = module.asyncToGenerator;
      _regeneratorRuntime = module.regeneratorRuntime;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      Node = module.Node;
      ScrollView = module.ScrollView;
      Button = module.Button;
      instantiate = module.instantiate;
    }, function (module) {
      WindowBase = module.WindowBase;
    }, function (module) {
      BuildDataManager = module.BuildDataManager;
    }, function (module) {
      SharedDefines = module.SharedDefines;
    }, function (module) {
      WindowManager = module.WindowManager;
    }, function (module) {
      CoinDisplay = module.CoinDisplay;
    }, function (module) {
      DiamondDisplay = module.DiamondDisplay;
    }, function (module) {
      BuildingManager = module.BuildingManager;
    }, function (module) {
      CraftScrollViewItem = module.CraftScrollViewItem;
    }],
    execute: function () {
      var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor10, _descriptor11;
      cclegacy._RF.push({}, "3ba238sJhJExKFO4IBALzZH", "CraftWindow", undefined);
      var ccclass = _decorator.ccclass,
        property = _decorator.property;
      var ViewType = /*#__PURE__*/function (ViewType) {
        ViewType[ViewType["BUILDING"] = 0] = "BUILDING";
        ViewType[ViewType["PLACEMENT"] = 1] = "PLACEMENT";
        return ViewType;
      }(ViewType || {});
      var CraftWindow = exports('CraftWindow', (_dec = ccclass('CraftWindow'), _dec2 = property(Node), _dec3 = property(Node), _dec4 = property(Node), _dec5 = property(ScrollView), _dec6 = property(Node), _dec7 = property(Node), _dec8 = property(CoinDisplay), _dec9 = property(DiamondDisplay), _dec10 = property(Button), _dec11 = property(Button), _dec12 = property(Button), _dec(_class = (_class2 = /*#__PURE__*/function (_WindowBase) {
        _inheritsLoose(CraftWindow, _WindowBase);
        function CraftWindow() {
          var _this;
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          _this = _WindowBase.call.apply(_WindowBase, [this].concat(args)) || this;
          _initializerDefineProperty(_this, "buildingView", _descriptor, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "placementView", _descriptor2, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "placementContainer", _descriptor3, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "scrollView", _descriptor4, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "itemTemplate", _descriptor5, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "content", _descriptor6, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "coinDisplay", _descriptor7, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "diamondDisplay", _descriptor8, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "btnPlacement", _descriptor9, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "btnCancel", _descriptor10, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "btnClose", _descriptor11, _assertThisInitialized(_this));
          _this.viewType = ViewType.BUILDING;
          _this.playerController = null;
          _this.buildItems = [];
          return _this;
        }
        var _proto = CraftWindow.prototype;
        _proto.initialize = function initialize() {
          _WindowBase.prototype.initialize.call(this);
          if (this.gameController) {
            this.playerController = this.gameController.getPlayerController();
            if (!this.playerController) {
              console.error('PlayerController not found on CraftWindow node');
              return;
            }
            if (this.coinDisplay) {
              this.coinDisplay.initialize(this.playerController.playerState);
            }
            if (this.diamondDisplay) {
              this.diamondDisplay.initialize(this.playerController.playerState);
            }
          }
          this.loadBuildItems();
          this.setupEventListeners();
        };
        _proto.setupEventListeners = function setupEventListeners() {
          if (this.playerController) {
            this.playerController.eventTarget.on(SharedDefines.EVENT_PLAYER_PLACEMENT_BUILDING, this.onPlacementBuilding, this);
          }
          if (this.btnClose) {
            this.btnClose.node.on(Button.EventType.CLICK, this.onCloseButtonClicked, this);
          } else {
            console.warn('Close button not found in CraftWindow');
          }
          if (this.btnPlacement) {
            this.btnPlacement.node.on(Button.EventType.CLICK, this.onBtnPlacementClicked, this);
          }
          if (this.btnCancel) {
            this.btnCancel.node.on(Button.EventType.CLICK, this.onBtnCancelClicked, this);
          }
        };
        _proto.onCloseButtonClicked = function onCloseButtonClicked() {
          WindowManager.instance.hide(SharedDefines.WINDOW_CRAFT_NAME);
        };
        _proto.loadBuildItems = /*#__PURE__*/function () {
          var _loadBuildItems = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee() {
            var buildDataList, _iterator, _step, buildData, item, craftScrollViewItem;
            return _regeneratorRuntime().wrap(function _callee$(_context) {
              while (1) switch (_context.prev = _context.next) {
                case 0:
                  if (!(!this.content || !this.itemTemplate)) {
                    _context.next = 3;
                    break;
                  }
                  console.error('Content node or item prefab is missing');
                  return _context.abrupt("return");
                case 3:
                  buildDataList = BuildDataManager.instance.getAllBuildData();
                  for (_iterator = _createForOfIteratorHelperLoose(buildDataList); !(_step = _iterator()).done;) {
                    buildData = _step.value;
                    item = instantiate(this.itemTemplate);
                    craftScrollViewItem = item.getComponent(CraftScrollViewItem);
                    if (craftScrollViewItem) {
                      craftScrollViewItem.initialize(buildData, this.onBuildItemClicked.bind(this));
                      this.content.addChild(item);
                      this.buildItems.push(item);
                    } else {
                      console.error('CraftScrollViewItem component not found on item prefab');
                    }
                  }
                  this.updateItemsVisibility();
                  //set itemTemplate to inactive
                  this.itemTemplate.active = false;
                case 7:
                case "end":
                  return _context.stop();
              }
            }, _callee, this);
          }));
          function loadBuildItems() {
            return _loadBuildItems.apply(this, arguments);
          }
          return loadBuildItems;
        }();
        _proto.updateItemsVisibility = function updateItemsVisibility() {
          if (!this.playerController) return;
          var playerLevel = this.playerController.playerState.level;
          for (var i = 0; i < this.buildItems.length; i++) {
            var item = this.buildItems[i].getComponent(CraftScrollViewItem);
            if (item) {
              item.updateVisibilityByLevel(playerLevel);
            }
          }
        };
        _proto.show = function show() {
          var _WindowBase$prototype;
          for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            args[_key2] = arguments[_key2];
          }
          (_WindowBase$prototype = _WindowBase.prototype.show).call.apply(_WindowBase$prototype, [this].concat(args));
          this.switchView(ViewType.BUILDING);
        };
        _proto.refreshItems = function refreshItems() {
          this.updateItemsVisibility();
        };
        _proto.switchView = function switchView(viewType) {
          this.viewType = viewType;
          if (this.viewType === ViewType.BUILDING) {
            this.buildingView.active = true;
            this.placementView.active = false;
            this.updateItemsVisibility();
            if (this.coinDisplay) {
              this.coinDisplay.refreshDisplay();
            }
            if (this.diamondDisplay) {
              this.diamondDisplay.refreshDisplay();
            }
          } else {
            this.buildingView.active = false;
            this.placementView.active = true;
          }
        };
        _proto.onBuildItemClicked = function onBuildItemClicked(buildData) {
          console.log("Build item clicked: " + buildData.name);
          var buildingManager = BuildingManager.instance;
          if (buildingManager.hasBuildingOfType(buildData.id)) {
            // 跳转到已有建筑
            buildingManager.focusOnBuilding(buildData.id);
          } else {
            //check if player has enough coins
            if (this.playerController.playerState.gold >= buildData.cost_coin) {
              // 开始新建筑放置
              this.switchView(ViewType.PLACEMENT);
              this.startBuildingPlacement(buildData);
            } else {
              //TODO 弹出对话框提示玩家没有足够的硬币
              console.log("Not enough coins");
            }
          }
        };
        _proto.startBuildingPlacement = function startBuildingPlacement(buildData) {
          if (this.playerController) {
            this.playerController.startBuildingPlacement(buildData, this.placementContainer);
          }
        };
        _proto.onBtnPlacementClicked = function onBtnPlacementClicked() {
          if (this.playerController) {
            this.playerController.tryPlacementBuilding();
          }
        };
        _proto.onBtnCancelClicked = function onBtnCancelClicked() {
          if (this.playerController) {
            this.playerController.cancelBuildingPlacement();
          }
        };
        _proto.onPlacementBuilding = function onPlacementBuilding(success) {
          if (!success) {
            this.switchView(ViewType.BUILDING);
          } else {
            WindowManager.instance.hide(SharedDefines.WINDOW_CRAFT_NAME);
          }
        };
        _proto.onDestroy = function onDestroy() {
          _WindowBase.prototype.onDestroy.call(this);
          if (this.btnClose) {
            this.btnClose.node.off(Button.EventType.CLICK, this.onCloseButtonClicked, this);
          }
          if (this.btnPlacement) {
            this.btnPlacement.node.off(Button.EventType.CLICK, this.onBtnPlacementClicked, this);
          }
          if (this.btnCancel) {
            this.btnCancel.node.off(Button.EventType.CLICK, this.onBtnCancelClicked, this);
          }
          for (var _iterator2 = _createForOfIteratorHelperLoose(this.buildItems), _step2; !(_step2 = _iterator2()).done;) {
            var item = _step2.value;
            var button = item.getComponent(Button);
            if (button) {
              button.node.off(Button.EventType.CLICK);
            }
          }
        };
        return CraftWindow;
      }(WindowBase), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "buildingView", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "placementView", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "placementContainer", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "scrollView", [_dec5], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "itemTemplate", [_dec6], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "content", [_dec7], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "coinDisplay", [_dec8], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "diamondDisplay", [_dec9], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "btnPlacement", [_dec10], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor10 = _applyDecoratedDescriptor(_class2.prototype, "btnCancel", [_dec11], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor11 = _applyDecoratedDescriptor(_class2.prototype, "btnClose", [_dec12], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      })), _class2)) || _class));
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/Crop.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './SharedDefines.ts', './CropDataManager.ts', './NetworkManager.ts', './GrowthableEntity.ts'], function (exports) {
  var _applyDecoratedDescriptor, _inheritsLoose, _initializerDefineProperty, _assertThisInitialized, _asyncToGenerator, _regeneratorRuntime, cclegacy, _decorator, Enum, Node, CropType, SharedDefines, GrowState, SceneItemState, CropDataManager, NetworkManager, GrowthableEntity;
  return {
    setters: [function (module) {
      _applyDecoratedDescriptor = module.applyDecoratedDescriptor;
      _inheritsLoose = module.inheritsLoose;
      _initializerDefineProperty = module.initializerDefineProperty;
      _assertThisInitialized = module.assertThisInitialized;
      _asyncToGenerator = module.asyncToGenerator;
      _regeneratorRuntime = module.regeneratorRuntime;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      Enum = module.Enum;
      Node = module.Node;
    }, function (module) {
      CropType = module.CropType;
      SharedDefines = module.SharedDefines;
      GrowState = module.GrowState;
      SceneItemState = module.SceneItemState;
    }, function (module) {
      CropDataManager = module.CropDataManager;
    }, function (module) {
      NetworkManager = module.NetworkManager;
    }, function (module) {
      GrowthableEntity = module.GrowthableEntity;
    }],
    execute: function () {
      var _dec, _dec2, _class, _class2, _descriptor;
      cclegacy._RF.push({}, "a03caDjiHhFnKW6O1UaGCiK", "Crop", undefined);
      var ccclass = _decorator.ccclass,
        property = _decorator.property;
      var Crop = exports('Crop', (_dec = ccclass('Crop'), _dec2 = property({
        type: Enum(CropType)
      }), _dec(_class = (_class2 = /*#__PURE__*/function (_GrowthableEntity) {
        _inheritsLoose(Crop, _GrowthableEntity);
        function Crop() {
          var _this;
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          _this = _GrowthableEntity.call.apply(_GrowthableEntity, [this].concat(args)) || this;
          _initializerDefineProperty(_this, "cropType", _descriptor, _assertThisInitialized(_this));
          _this.cropDatas = [];
          _this.cropDataIndex = 0;
          return _this;
        }
        var _proto = Crop.prototype;
        _proto.initialize = function initialize(id) {
          this.baseSpritePath = SharedDefines.CROPS_TEXTURES;
          this.loadEntityData(id);
          if (this.growthStages.length > 0) {
            this.setupData(this.growthStages[0]);
            // this.updateSprite(`${this.baseSpritePath}${this.growthStages[0].png}`);
          } else {
            console.error("No growth stages found for crop with id: " + id);
          }
          // this.updateSprite(`${SharedDefines.WINDOW_GAME_TEXTURES}${this.cropDatas[0].icon}`);
        };

        _proto.initializeWithSceneItem = function initializeWithSceneItem(sceneItem, isPlayerOwner) {
          this.baseSpritePath = SharedDefines.CROPS_TEXTURES;
          _GrowthableEntity.prototype.initializeWithSceneItem.call(this, sceneItem, isPlayerOwner);
        };
        _proto.loadEntityData = function loadEntityData(id) {
          var cropData = CropDataManager.instance.findCropDataById(id);
          if (!cropData) {
            console.error("No crop data found for id: " + id);
            return;
          }
          this.cropType = parseInt(cropData.crop_type);
          this.growthStages = CropDataManager.instance.filterCropDataByCropType(this.cropType.toString());
        };
        _proto.setupData = function setupData(cropData) {
          this.id = cropData.id;
          this.growthTime = cropData.time_min * SharedDefines.TIME_MINUTE;
          this.harvestItemId = cropData.harvest_item_id;
          this.levelNeed = cropData.level_need;
        };
        _proto.canHarvest = function canHarvest() {
          //log states
          console.log("Crop " + this.node.name + " growState = " + this.growState + ", sceneItem.state = " + this.sceneItem.state + ", harvestItemId = " + this.harvestItemId);
          return (this.growState == GrowState.HARVESTING || this.sceneItem.state == SceneItemState.Dead) && this.harvestItemId != "" && this.isPlayerOwner;
        };
        _proto.harvest = /*#__PURE__*/function () {
          var _harvest = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee() {
            var result;
            return _regeneratorRuntime().wrap(function _callee$(_context) {
              while (1) switch (_context.prev = _context.next) {
                case 0:
                  console.log("Crop " + this.node.name + " harvest");
                  if (this.canHarvest()) {
                    _context.next = 4;
                    break;
                  }
                  console.error("Crop " + this.node.name + " harvest failed");
                  return _context.abrupt("return");
                case 4:
                  _context.next = 6;
                  return NetworkManager.instance.harvest(this.sceneItem.id, this.sceneItem.item_id, this.sceneItem.type);
                case 6:
                  result = _context.sent;
                  if (!result) {
                    _context.next = 16;
                    break;
                  }
                  this.growState = GrowState.NONE;
                  this.eventTarget.emit(SharedDefines.EVENT_CROP_HARVEST, this);
                  this.node.off(Node.EventType.TOUCH_END, this.harvest, this);
                  this.stopDiseaseStatusUpdates();
                  this.node.destroy();
                  return _context.abrupt("return");
                case 16:
                  console.error("Crop " + this.node.name + " harvest failed");
                  return _context.abrupt("return");
                case 18:
                case "end":
                  return _context.stop();
              }
            }, _callee, this);
          }));
          function harvest() {
            return _harvest.apply(this, arguments);
          }
          return harvest;
        }();
        _proto.canCare = function canCare() {
          return this.careCount >= 0 && this.careCount < SharedDefines.MAX_CROP_CARE_COUNT && this.lastCareTime + SharedDefines.CARE_COOLDOWN < Date.now() / 1000;
        };
        _proto.canTreat = function canTreat() {
          return this.treatCount >= 0 && this.treatCount < SharedDefines.MAX_CROP_TREAT_COUNT && this.lastTreatTime + SharedDefines.TREAT_COOLDOWN < Date.now() / 1000;
        };
        _proto.canCleanse = function canCleanse() {
          return this.cleanseCount >= 0 && this.cleanseCount < SharedDefines.MAX_CROP_CLEANSE_COUNT && this.lastCleanseTime + SharedDefines.CLEANSE_COOLDOWN < Date.now() / 1000;
        };
        _proto.care = /*#__PURE__*/function () {
          var _care = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2() {
            var careResult;
            return _regeneratorRuntime().wrap(function _callee2$(_context2) {
              while (1) switch (_context2.prev = _context2.next) {
                case 0:
                  if (this.canCare()) {
                    _context2.next = 2;
                    break;
                  }
                  return _context2.abrupt("return", null);
                case 2:
                  _context2.next = 4;
                  return NetworkManager.instance.care(this.sceneItem.id);
                case 4:
                  careResult = _context2.sent;
                  if (!careResult.success) {
                    _context2.next = 11;
                    break;
                  }
                  this.CareCount = careResult.data.care_count;
                  this.lastCareTime = Date.now() / 1000;
                  return _context2.abrupt("return", careResult);
                case 11:
                  console.log("Care failed");
                case 12:
                  return _context2.abrupt("return", null);
                case 13:
                case "end":
                  return _context2.stop();
              }
            }, _callee2, this);
          }));
          function care() {
            return _care.apply(this, arguments);
          }
          return care;
        }();
        _proto.careByFriend = /*#__PURE__*/function () {
          var _careByFriend = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee3(friendId) {
            var careResult;
            return _regeneratorRuntime().wrap(function _callee3$(_context3) {
              while (1) switch (_context3.prev = _context3.next) {
                case 0:
                  if (this.canCare()) {
                    _context3.next = 2;
                    break;
                  }
                  return _context3.abrupt("return", null);
                case 2:
                  _context3.next = 4;
                  return NetworkManager.instance.careFriend(this.sceneItem.id, friendId);
                case 4:
                  careResult = _context3.sent;
                  if (!careResult.success) {
                    _context3.next = 12;
                    break;
                  }
                  this.CareCount = careResult.data.care_count;
                  this.lastCareTime = Date.now() / 1000;
                  if (careResult.data.friend_id) {
                    console.log("care friend , name = " + careResult.data.friend_id + " , friend_id = " + friendId + " , diamond_added = " + careResult.data.diamond_added);

                    //await this.playDiamondCollectionEffect(careResult.data.diamond_added);
                  }

                  return _context3.abrupt("return", careResult);
                case 12:
                  console.log("Care failed");
                case 13:
                  return _context3.abrupt("return", null);
                case 14:
                case "end":
                  return _context3.stop();
              }
            }, _callee3, this);
          }));
          function careByFriend(_x) {
            return _careByFriend.apply(this, arguments);
          }
          return careByFriend;
        }();
        _proto.treat = /*#__PURE__*/function () {
          var _treat = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee4() {
            var treatResult;
            return _regeneratorRuntime().wrap(function _callee4$(_context4) {
              while (1) switch (_context4.prev = _context4.next) {
                case 0:
                  if (this.canTreat()) {
                    _context4.next = 2;
                    break;
                  }
                  return _context4.abrupt("return", null);
                case 2:
                  _context4.next = 4;
                  return NetworkManager.instance.treat(this.sceneItem.id);
                case 4:
                  treatResult = _context4.sent;
                  if (!treatResult.success) {
                    _context4.next = 11;
                    break;
                  }
                  this.TreatCount = treatResult.data.treat_count;
                  this.lastTreatTime = Date.now() / 1000;
                  return _context4.abrupt("return", treatResult);
                case 11:
                  console.log("Treat failed");
                case 12:
                  return _context4.abrupt("return", null);
                case 13:
                case "end":
                  return _context4.stop();
              }
            }, _callee4, this);
          }));
          function treat() {
            return _treat.apply(this, arguments);
          }
          return treat;
        }();
        _proto.treatByFriend = /*#__PURE__*/function () {
          var _treatByFriend = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee5(friendId) {
            var treatResult;
            return _regeneratorRuntime().wrap(function _callee5$(_context5) {
              while (1) switch (_context5.prev = _context5.next) {
                case 0:
                  if (this.canTreat()) {
                    _context5.next = 2;
                    break;
                  }
                  return _context5.abrupt("return", null);
                case 2:
                  _context5.next = 4;
                  return NetworkManager.instance.treatFriend(this.sceneItem.id, friendId);
                case 4:
                  treatResult = _context5.sent;
                  if (!treatResult.success) {
                    _context5.next = 12;
                    break;
                  }
                  this.TreatCount = treatResult.data.treat_count;
                  this.lastTreatTime = Date.now() / 1000;
                  if (treatResult.data.friend_id) {
                    console.log("treat friend , name = " + treatResult.data.friend_id + " , friend_id = " + friendId + " , diamond_added = " + treatResult.data.diamond_added);
                  }
                  return _context5.abrupt("return", treatResult);
                case 12:
                  console.log("Treat failed");
                case 13:
                  return _context5.abrupt("return", null);
                case 14:
                case "end":
                  return _context5.stop();
              }
            }, _callee5, this);
          }));
          function treatByFriend(_x2) {
            return _treatByFriend.apply(this, arguments);
          }
          return treatByFriend;
        }();
        _proto.cleanse = /*#__PURE__*/function () {
          var _cleanse = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee6() {
            var cleanseResult;
            return _regeneratorRuntime().wrap(function _callee6$(_context6) {
              while (1) switch (_context6.prev = _context6.next) {
                case 0:
                  if (this.canCleanse()) {
                    _context6.next = 2;
                    break;
                  }
                  return _context6.abrupt("return", null);
                case 2:
                  _context6.next = 4;
                  return NetworkManager.instance.cleanse(this.sceneItem.id);
                case 4:
                  cleanseResult = _context6.sent;
                  if (!cleanseResult.success) {
                    _context6.next = 11;
                    break;
                  }
                  this.CleanseCount = cleanseResult.data.cleanse_count;
                  this.lastCleanseTime = Date.now() / 1000;
                  return _context6.abrupt("return", cleanseResult);
                case 11:
                  console.log("Cleanse failed");
                case 12:
                  return _context6.abrupt("return", null);
                case 13:
                case "end":
                  return _context6.stop();
              }
            }, _callee6, this);
          }));
          function cleanse() {
            return _cleanse.apply(this, arguments);
          }
          return cleanse;
        }();
        _proto.cleanseByFriend = /*#__PURE__*/function () {
          var _cleanseByFriend = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee7(friendId) {
            var cleanseResult;
            return _regeneratorRuntime().wrap(function _callee7$(_context7) {
              while (1) switch (_context7.prev = _context7.next) {
                case 0:
                  if (this.canCleanse()) {
                    _context7.next = 2;
                    break;
                  }
                  return _context7.abrupt("return", null);
                case 2:
                  _context7.next = 4;
                  return NetworkManager.instance.cleanseFriend(this.sceneItem.id, friendId);
                case 4:
                  cleanseResult = _context7.sent;
                  if (!cleanseResult.success) {
                    _context7.next = 11;
                    break;
                  }
                  this.CleanseCount = cleanseResult.data.cleanse_count;
                  this.lastCleanseTime = Date.now() / 1000;
                  return _context7.abrupt("return", cleanseResult);
                case 11:
                  console.log("Cleanse failed");
                case 12:
                  return _context7.abrupt("return", null);
                case 13:
                case "end":
                  return _context7.stop();
              }
            }, _callee7, this);
          }));
          function cleanseByFriend(_x3) {
            return _cleanseByFriend.apply(this, arguments);
          }
          return cleanseByFriend;
        }();
        return Crop;
      }(GrowthableEntity), _descriptor = _applyDecoratedDescriptor(_class2.prototype, "cropType", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return CropType.CORN;
        }
      }), _class2)) || _class));
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/CropDataManager.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './SharedDefines.ts'], function (exports) {
  var _createClass, _asyncToGenerator, _regeneratorRuntime, cclegacy, resources, JsonAsset, SharedDefines;
  return {
    setters: [function (module) {
      _createClass = module.createClass;
      _asyncToGenerator = module.asyncToGenerator;
      _regeneratorRuntime = module.regeneratorRuntime;
    }, function (module) {
      cclegacy = module.cclegacy;
      resources = module.resources;
      JsonAsset = module.JsonAsset;
    }, function (module) {
      SharedDefines = module.SharedDefines;
    }],
    execute: function () {
      cclegacy._RF.push({}, "85c17ALda9ABLUWg1ILeD8C", "CropDataManager", undefined);
      var CropDataManager = exports('CropDataManager', /*#__PURE__*/function () {
        function CropDataManager() {
          this.cropDataList = [];
        }
        var _proto = CropDataManager.prototype;
        _proto.loadCropData = /*#__PURE__*/function () {
          var _loadCropData = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee() {
            var _this = this;
            return _regeneratorRuntime().wrap(function _callee$(_context) {
              while (1) switch (_context.prev = _context.next) {
                case 0:
                  return _context.abrupt("return", new Promise(function (resolve, reject) {
                    resources.load(SharedDefines.JSON_CROP_DATA, JsonAsset, function (err, jsonAsset) {
                      if (err) {
                        console.error('Failed to load CropsData:', err);
                        reject(err);
                        return;
                      }
                      _this.cropDataList = jsonAsset.json.list;
                      resolve();
                    });
                  }));
                case 1:
                case "end":
                  return _context.stop();
              }
            }, _callee);
          }));
          function loadCropData() {
            return _loadCropData.apply(this, arguments);
          }
          return loadCropData;
        }();
        _proto.findCropDataById = function findCropDataById(id) {
          return this.cropDataList.find(function (crop) {
            return crop.id === id;
          });
        };
        _proto.findCropDataByName = function findCropDataByName(name) {
          return this.cropDataList.find(function (crop) {
            return crop.name === name;
          });
        };
        _proto.filterCropDataByCropType = function filterCropDataByCropType(cropType) {
          return this.cropDataList.filter(function (crop) {
            return crop.crop_type === cropType;
          });
        };
        _proto.filterCropDataByFarmType = function filterCropDataByFarmType(farmType) {
          return this.cropDataList.filter(function (crop) {
            return crop.farm_type === farmType;
          });
        };
        _proto.filterCropDataByMaxLevel = function filterCropDataByMaxLevel(maxLevel) {
          return this.cropDataList.filter(function (crop) {
            return parseInt(crop.level_need) <= maxLevel;
          });
        };
        _proto.getAllCropData = function getAllCropData() {
          return [].concat(this.cropDataList);
        };
        _proto.getCropDataCount = function getCropDataCount() {
          return this.cropDataList.length;
        };
        _proto.isCropDataLoaded = function isCropDataLoaded() {
          return this.cropDataList.length > 0;
        };
        _createClass(CropDataManager, null, [{
          key: "instance",
          get: function get() {
            if (this._instance === null) {
              this._instance = new CropDataManager();
            }
            return this._instance;
          }
        }]);
        return CropDataManager;
      }());
      CropDataManager._instance = null;
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/CurrencyDisplayBase.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc'], function (exports) {
  var _applyDecoratedDescriptor, _inheritsLoose, _initializerDefineProperty, _assertThisInitialized, cclegacy, _decorator, Node, Label, Component;
  return {
    setters: [function (module) {
      _applyDecoratedDescriptor = module.applyDecoratedDescriptor;
      _inheritsLoose = module.inheritsLoose;
      _initializerDefineProperty = module.initializerDefineProperty;
      _assertThisInitialized = module.assertThisInitialized;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      Node = module.Node;
      Label = module.Label;
      Component = module.Component;
    }],
    execute: function () {
      var _dec, _dec2, _dec3, _class, _class2, _descriptor, _descriptor2;
      cclegacy._RF.push({}, "28242QeQPNNC7yrXEy5FX7l", "CurrencyDisplayBase", undefined);
      var ccclass = _decorator.ccclass,
        property = _decorator.property;
      var CurrencyDisplayBase = exports('CurrencyDisplayBase', (_dec = ccclass('CurrencyDisplayBase'), _dec2 = property(Node), _dec3 = property(Label), _dec(_class = (_class2 = /*#__PURE__*/function (_Component) {
        _inheritsLoose(CurrencyDisplayBase, _Component);
        function CurrencyDisplayBase() {
          var _this;
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          _this = _Component.call.apply(_Component, [this].concat(args)) || this;
          _initializerDefineProperty(_this, "currencySpriteNode", _descriptor, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "lblCurrency", _descriptor2, _assertThisInitialized(_this));
          _this.playerState = null;
          return _this;
        }
        var _proto = CurrencyDisplayBase.prototype;
        _proto.initialize = function initialize(playerState) {
          this.playerState = playerState;
          this.setupEventListeners();
          this.refreshDisplay();
        };
        _proto.setupEventListeners = function setupEventListeners() {
          if (this.playerState) {
            this.playerState.eventTarget.on(this.eventName, this.refreshDisplay, this);
          }
        };
        _proto.refreshDisplay = function refreshDisplay() {
          if (this.playerState && this.lblCurrency) {
            this.lblCurrency.string = this.getCurrencyValue().toString();
          }
        };
        _proto.onDestroy = function onDestroy() {
          if (this.playerState) {
            this.playerState.eventTarget.off(this.eventName, this.refreshDisplay, this);
          }
        };
        return CurrencyDisplayBase;
      }(Component), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "currencySpriteNode", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "lblCurrency", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      })), _class2)) || _class));
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/DashFunManager.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './NetworkManager.ts'], function (exports) {
  var _inheritsLoose, _createClass, _assertThisInitialized, _asyncToGenerator, _regeneratorRuntime, cclegacy, _decorator, EventTarget, Component, NetworkManager;
  return {
    setters: [function (module) {
      _inheritsLoose = module.inheritsLoose;
      _createClass = module.createClass;
      _assertThisInitialized = module.assertThisInitialized;
      _asyncToGenerator = module.asyncToGenerator;
      _regeneratorRuntime = module.regeneratorRuntime;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      EventTarget = module.EventTarget;
      Component = module.Component;
    }, function (module) {
      NetworkManager = module.NetworkManager;
    }],
    execute: function () {
      cclegacy._RF.push({}, "2ad713z18ZPnpiQ1N7pmLwg", "DashFunManager", undefined);
      var ccclass = _decorator.ccclass,
        property = _decorator.property;
      var UserProfile = exports('UserProfile', function UserProfile() {
        this.id = void 0;
        this.channelId = void 0;
        this.displayName = void 0;
        this.userName = void 0;
        this.avatarUrl = void 0;
        this.from = void 0;
        this.createData = void 0;
        this.loginTime = void 0;
      });
      var PayItemType = exports('PayItemType', /*#__PURE__*/function (PayItemType) {
        PayItemType[PayItemType["Coin"] = 0] = "Coin";
        PayItemType[PayItemType["Diamond"] = 1] = "Diamond";
        return PayItemType;
      }({}));
      var DashFunManager = exports('DashFunManager', /*#__PURE__*/function (_Component) {
        _inheritsLoose(DashFunManager, _Component);
        //define constructor
        function DashFunManager() {
          var _this;
          _this = _Component.call(this) || this;
          _this._gameId = "ForTest";
          _this.eventTarget = new EventTarget();
          console.log("DashFunManager constructor");
          window.addEventListener("message", _this.onMessage.bind(_assertThisInitialized(_this)));
          return _this;
        }
        var _proto = DashFunManager.prototype;
        _proto.start = function start() {}

        /*
        const {parent} = window;
        const msg = {
        dashfun:{
        method:"loading",
        payload:{
        value:1, //value取值范围0-100
        }
        }
        }
        parent.postMessage(msg, "*")
        */;
        _proto.updateLoadingProgress = function updateLoadingProgress(value) {
          var msg = {
            dashfun: {
              method: "loading",
              payload: {
                value: value //value取值范围0-100
              }
            }
          };

          console.log("updateLoadingProgress " + value);
          window.parent.postMessage(msg, "*");

          // if (typeof window.loading === 'function') {
          //     window.loading(value);
          // }
        }

        /**
         * type UserProfile = {
        id: string				//dashfun userId
        channelId: string		//渠道方id，此处为TG的用户Id
        displayName: string 	//显示名称
        userName: string 		//用户名
        avatarUrl: string		//avatar地址
        from: number			//用户来源
        createData: number		//创建时间
        loginTime: number		//登录时间
        logoffTime: number		//登出时间
        language: string		//language code
        }
        const { parent } = window;
        const msg = {
        dashfun:{
        method:"getUserProfile"
        }
        }
        //发送消息
        parent.postMessage(msg, "*")
        //接收结果
        window.addEventListener("message", ({data}) => {
        const dashfun = data.dashfun;
        if(!dashfun) return;
        //回应消息的名字=发送消息的名字+Result
        if(dashfun.method == "getUserProfileResult"){
        console.log(dashfun.result.data) //UserProfile
        }
        })
         */;
        _proto.getUserProfile = function getUserProfile() {
          console.log("getUserProfile start...");
          var msg = {
            dashfun: {
              method: "getUserProfile"
            }
          };
          window.parent.postMessage(msg, "*");
        }

        /*
        type PaymentRequest = {
        title:string, //付费项目名称，将显示在telegram的支付界面上
        desc:string, //项目描述
        info:string, //支付携带信息
        price:number, //付费项目价格，单位为telegram stars
        }
        type PaymentRequestResult = {
        invoiceLink: string, //tg invokce 链接
        paymentId: string, //dashfun平台paymentId
        }
        const { parent } = window;
        const msg = {
        dashfun:{
        method: "requestPayment",
        payload:{ //PaymentRequest
        title:"200钻石",
        desc: "购买200钻石",
        info: "200钻石",
        price: 2,
        }
        }
        }
        //发送消息
        parent.postMessage(msg, "*")
        */;
        _proto.requestPayment = function requestPayment(title, desc, type, price) {
          console.log("requestPayment title: " + title + " , desc: " + desc + " , type: " + type + " , price: " + price + " , ceshi");
          var msg = {
            dashfun: {
              method: "requestPayment",
              payload: {
                title: title,
                desc: desc,
                info: type.toString(),
                price: price
              }
            }
          };
          window.parent.postMessage(msg, "*");
        }

        /*
        type OpenInvoiceRequest = {
        invoiceLink: string, //tg invokce 链接
        paymentId: string, //dashfun平台paymentId
        }
        type OpenInvoiceResult = {
        paymentId: string, //dashfun平台paymentId
        status: "paid"|"canceled"|"failed"
        }
        const { parent } = window;
        const msg = {
        dashfun:{
        method: "openInvoice",
        payload:{ //OpenInvoiceRequest
        invoiceLink: "https:/t.me/$xxxxxxx",
        paymentId: "12345"
        }
        }
        }
        //发送消息
        parent.postMessage(msg, "*")
        //接收结果
        window.addEventListener("message", ({data})=>{
        const dashfun = data.dashfun;
        if(!dashfun) return;
        //回应消息的名字=发送消息的名字+Result
        if(dashfun.method == "openInvoiceResult"){
        console.log(dashfun.result.data) //OpenInvoiceResult
        const {paymentId, status} = dashfun.result.data;
        }
        })
        */;
        _proto.openInvoice = function openInvoice(invoiceLink, paymentId) {
          console.log("openInvoice " + invoiceLink + " , paymentId: " + paymentId);
          var msg = {
            dashfun: {
              method: "openInvoice",
              payload: {
                invoiceLink: invoiceLink,
                paymentId: paymentId
              }
            }
          };
          window.parent.postMessage(msg, "*");
        };
        _proto.onMessage = /*#__PURE__*/function () {
          var _onMessage = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(event) {
            var data, dashfun, _dashfun$result$data, paymentId, status, result, type;
            return _regeneratorRuntime().wrap(function _callee$(_context) {
              while (1) switch (_context.prev = _context.next) {
                case 0:
                  console.log("onMessage start ...");
                  data = event.data;
                  dashfun = data.dashfun;
                  if (dashfun) {
                    _context.next = 5;
                    break;
                  }
                  return _context.abrupt("return");
                case 5:
                  if (dashfun.method == DashFunManager.EVENT_GET_USER_PROFILE_RESULT) {
                    this.eventTarget.emit(DashFunManager.EVENT_GET_USER_PROFILE_RESULT, dashfun.result.data);
                  }
                  if (dashfun.method == DashFunManager.EVENT_REQUEST_PAYMENT_RESULT) {
                    this.openInvoice(dashfun.result.data.invoiceLink, dashfun.result.data.paymentId);
                    //this.eventTarget.emit(DashFunManager.EVENT_REQUEST_PAYMENT_RESULT, dashfun.result.data);
                  }

                  if (!(dashfun.method == DashFunManager.EVENT_OPEN_INVOICE_RESULT)) {
                    _context.next = 16;
                    break;
                  }
                  _dashfun$result$data = dashfun.result.data, paymentId = _dashfun$result$data.paymentId, status = _dashfun$result$data.status;
                  console.log("openInvoiceResult paymentId: " + paymentId + " , status: " + status);
                  if (!(status == "paid")) {
                    _context.next = 16;
                    break;
                  }
                  _context.next = 13;
                  return NetworkManager.instance.queryPaymentResult("ForTest", paymentId);
                case 13:
                  result = _context.sent;
                  //LOG RESULT
                  console.log("queryPaymentResult result: " + JSON.stringify(result));
                  if (result.success) {
                    type = parseInt(result.data.type);
                    if (type == PayItemType.Coin) {
                      //add coin
                      console.log("queryPaymentResult success: " + JSON.stringify(result));
                    } else if (type == PayItemType.Diamond) {
                      //add diamond
                      console.log("queryPaymentResult success: " + JSON.stringify(result));
                    }
                    this.eventTarget.emit(DashFunManager.EVENT_OPEN_INVOICE_RESULT, result.success, type, result.data.amount);
                  }
                case 16:
                case "end":
                  return _context.stop();
              }
            }, _callee, this);
          }));
          function onMessage(_x) {
            return _onMessage.apply(this, arguments);
          }
          return onMessage;
        }();
        _createClass(DashFunManager, null, [{
          key: "instance",
          get: function get() {
            if (this._instance == null) {
              this._instance = new DashFunManager();
            }
            return this._instance;
          }
        }]);
        return DashFunManager;
      }(Component));
      //define getUserProfileResult event
      DashFunManager.EVENT_GET_USER_PROFILE_RESULT = "getUserProfileResult";
      //define requestPaymentResult event
      DashFunManager.EVENT_REQUEST_PAYMENT_RESULT = "requestPaymentResult";
      //define openInvoiceResult event
      DashFunManager.EVENT_OPEN_INVOICE_RESULT = "openInvoiceResult";
      DashFunManager._instance = null;
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/DateHelper.ts", ['cc'], function (exports) {
  var cclegacy, _decorator;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
    }],
    execute: function () {
      cclegacy._RF.push({}, "df561+Z03BHOLmXe1gUTP+I", "DateHelper", undefined);
      var ccclass = _decorator.ccclass,
        property = _decorator.property;
      // helpers/DateHelper.ts

      var DateHelper = exports('DateHelper', /*#__PURE__*/function () {
        function DateHelper() {}
        /**
         * 将日期时间字符串转换为 Date 对象
         * @param dateString 日期时间字符串
         * @returns Date 对象，如果转换失败则返回 null
         */
        DateHelper.stringToDate = function stringToDate(dateString) {
          if (typeof dateString !== 'string') {
            console.error('Input is not a string', dateString);
            return new Date();
          }
          var date = new Date(dateString);
          if (isNaN(date.getTime())) {
            console.error('Invalid date string', dateString);
            return null;
          }
          return date;
        }

        /**
         * 计算从给定日期到现在的经过时间（毫秒）
         * @param date Date 对象或日期时间字符串
         * @returns 经过的毫秒数，如果输入无效则返回 null
         */;
        DateHelper.getElapsedTime = function getElapsedTime(date) {
          var startDate;
          if (typeof date === 'string') {
            startDate = this.stringToDate(date);
          } else if (date instanceof Date) {
            startDate = date;
          } else {
            console.error('Invalid input type for getElapsedTime', date);
            return null;
          }
          if (!startDate) {
            return null;
          }
          return Date.now() - startDate.getTime();
        };
        return DateHelper;
      }());
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/debug-view-runtime-control.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc'], function (exports) {
  var _applyDecoratedDescriptor, _inheritsLoose, _initializerDefineProperty, _assertThisInitialized, cclegacy, _decorator, Node, Color, Canvas, UITransform, instantiate, Label, RichText, Toggle, Button, director, Component;
  return {
    setters: [function (module) {
      _applyDecoratedDescriptor = module.applyDecoratedDescriptor;
      _inheritsLoose = module.inheritsLoose;
      _initializerDefineProperty = module.initializerDefineProperty;
      _assertThisInitialized = module.assertThisInitialized;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      Node = module.Node;
      Color = module.Color;
      Canvas = module.Canvas;
      UITransform = module.UITransform;
      instantiate = module.instantiate;
      Label = module.Label;
      RichText = module.RichText;
      Toggle = module.Toggle;
      Button = module.Button;
      director = module.director;
      Component = module.Component;
    }],
    execute: function () {
      var _dec, _dec2, _dec3, _dec4, _class, _class2, _descriptor, _descriptor2, _descriptor3;
      cclegacy._RF.push({}, "b2bd1+njXxJxaFY3ymm06WU", "debug-view-runtime-control", undefined);
      var ccclass = _decorator.ccclass,
        property = _decorator.property;
      var DebugViewRuntimeControl = exports('DebugViewRuntimeControl', (_dec = ccclass('internal.DebugViewRuntimeControl'), _dec2 = property(Node), _dec3 = property(Node), _dec4 = property(Node), _dec(_class = (_class2 = /*#__PURE__*/function (_Component) {
        _inheritsLoose(DebugViewRuntimeControl, _Component);
        function DebugViewRuntimeControl() {
          var _this;
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          _this = _Component.call.apply(_Component, [this].concat(args)) || this;
          _initializerDefineProperty(_this, "compositeModeToggle", _descriptor, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "singleModeToggle", _descriptor2, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "EnableAllCompositeModeButton", _descriptor3, _assertThisInitialized(_this));
          _this._single = 0;
          _this.strSingle = ['No Single Debug', 'Vertex Color', 'Vertex Normal', 'Vertex Tangent', 'World Position', 'Vertex Mirror', 'Face Side', 'UV0', 'UV1', 'UV Lightmap', 'Project Depth', 'Linear Depth', 'Fragment Normal', 'Fragment Tangent', 'Fragment Binormal', 'Base Color', 'Diffuse Color', 'Specular Color', 'Transparency', 'Metallic', 'Roughness', 'Specular Intensity', 'IOR', 'Direct Diffuse', 'Direct Specular', 'Direct All', 'Env Diffuse', 'Env Specular', 'Env All', 'Emissive', 'Light Map', 'Shadow', 'AO', 'Fresnel', 'Direct Transmit Diffuse', 'Direct Transmit Specular', 'Env Transmit Diffuse', 'Env Transmit Specular', 'Transmit All', 'Direct Internal Specular', 'Env Internal Specular', 'Internal All', 'Fog'];
          _this.strComposite = ['Direct Diffuse', 'Direct Specular', 'Env Diffuse', 'Env Specular', 'Emissive', 'Light Map', 'Shadow', 'AO', 'Normal Map', 'Fog', 'Tone Mapping', 'Gamma Correction', 'Fresnel', 'Transmit Diffuse', 'Transmit Specular', 'Internal Specular', 'TT'];
          _this.strMisc = ['CSM Layer Coloration', 'Lighting With Albedo'];
          _this.compositeModeToggleList = [];
          _this.singleModeToggleList = [];
          _this.miscModeToggleList = [];
          _this.textComponentList = [];
          _this.labelComponentList = [];
          _this.textContentList = [];
          _this.hideButtonLabel = void 0;
          _this._currentColorIndex = 0;
          _this.strColor = ['<color=#ffffff>', '<color=#000000>', '<color=#ff0000>', '<color=#00ff00>', '<color=#0000ff>'];
          _this.color = [Color.WHITE, Color.BLACK, Color.RED, Color.GREEN, Color.BLUE];
          return _this;
        }
        var _proto = DebugViewRuntimeControl.prototype;
        _proto.start = function start() {
          // get canvas resolution
          var canvas = this.node.parent.getComponent(Canvas);
          if (!canvas) {
            console.error('debug-view-runtime-control should be child of Canvas');
            return;
          }
          var uiTransform = this.node.parent.getComponent(UITransform);
          var halfScreenWidth = uiTransform.width * 0.5;
          var halfScreenHeight = uiTransform.height * 0.5;
          var x = -halfScreenWidth + halfScreenWidth * 0.1,
            y = halfScreenHeight - halfScreenHeight * 0.1;
          var width = 200,
            height = 20;

          // new nodes
          var miscNode = this.node.getChildByName('MiscMode');
          var buttonNode = instantiate(miscNode);
          buttonNode.parent = this.node;
          buttonNode.name = 'Buttons';
          var titleNode = instantiate(miscNode);
          titleNode.parent = this.node;
          titleNode.name = 'Titles';

          // title
          for (var i = 0; i < 2; i++) {
            var newLabel = instantiate(this.EnableAllCompositeModeButton.getChildByName('Label'));
            newLabel.setPosition(x + (i > 0 ? 50 + width * 2 : 150), y, 0.0);
            newLabel.setScale(0.75, 0.75, 0.75);
            newLabel.parent = titleNode;
            var _labelComponent = newLabel.getComponent(Label);
            _labelComponent.string = i ? '----------Composite Mode----------' : '----------Single Mode----------';
            _labelComponent.color = Color.WHITE;
            _labelComponent.overflow = 0;
            this.labelComponentList[this.labelComponentList.length] = _labelComponent;
          }
          y -= height;
          // single
          var currentRow = 0;
          for (var _i = 0; _i < this.strSingle.length; _i++, currentRow++) {
            if (_i === this.strSingle.length >> 1) {
              x += width;
              currentRow = 0;
            }
            var newNode = _i ? instantiate(this.singleModeToggle) : this.singleModeToggle;
            newNode.setPosition(x, y - height * currentRow, 0.0);
            newNode.setScale(0.5, 0.5, 0.5);
            newNode.parent = this.singleModeToggle.parent;
            var textComponent = newNode.getComponentInChildren(RichText);
            textComponent.string = this.strSingle[_i];
            this.textComponentList[this.textComponentList.length] = textComponent;
            this.textContentList[this.textContentList.length] = textComponent.string;
            newNode.on(Toggle.EventType.TOGGLE, this.toggleSingleMode, this);
            this.singleModeToggleList[_i] = newNode;
          }
          x += width;
          // buttons
          this.EnableAllCompositeModeButton.setPosition(x + 15, y, 0.0);
          this.EnableAllCompositeModeButton.setScale(0.5, 0.5, 0.5);
          this.EnableAllCompositeModeButton.on(Button.EventType.CLICK, this.enableAllCompositeMode, this);
          this.EnableAllCompositeModeButton.parent = buttonNode;
          var labelComponent = this.EnableAllCompositeModeButton.getComponentInChildren(Label);
          this.labelComponentList[this.labelComponentList.length] = labelComponent;
          var changeColorButton = instantiate(this.EnableAllCompositeModeButton);
          changeColorButton.setPosition(x + 90, y, 0.0);
          changeColorButton.setScale(0.5, 0.5, 0.5);
          changeColorButton.on(Button.EventType.CLICK, this.changeTextColor, this);
          changeColorButton.parent = buttonNode;
          labelComponent = changeColorButton.getComponentInChildren(Label);
          labelComponent.string = 'TextColor';
          this.labelComponentList[this.labelComponentList.length] = labelComponent;
          var HideButton = instantiate(this.EnableAllCompositeModeButton);
          HideButton.setPosition(x + 200, y, 0.0);
          HideButton.setScale(0.5, 0.5, 0.5);
          HideButton.on(Button.EventType.CLICK, this.hideUI, this);
          HideButton.parent = this.node.parent;
          labelComponent = HideButton.getComponentInChildren(Label);
          labelComponent.string = 'Hide UI';
          this.labelComponentList[this.labelComponentList.length] = labelComponent;
          this.hideButtonLabel = labelComponent;

          // misc
          y -= 40;
          for (var _i2 = 0; _i2 < this.strMisc.length; _i2++) {
            var _newNode = instantiate(this.compositeModeToggle);
            _newNode.setPosition(x, y - height * _i2, 0.0);
            _newNode.setScale(0.5, 0.5, 0.5);
            _newNode.parent = miscNode;
            var _textComponent = _newNode.getComponentInChildren(RichText);
            _textComponent.string = this.strMisc[_i2];
            this.textComponentList[this.textComponentList.length] = _textComponent;
            this.textContentList[this.textContentList.length] = _textComponent.string;
            var toggleComponent = _newNode.getComponent(Toggle);
            toggleComponent.isChecked = _i2 ? true : false;
            _newNode.on(Toggle.EventType.TOGGLE, _i2 ? this.toggleLightingWithAlbedo : this.toggleCSMColoration, this);
            this.miscModeToggleList[_i2] = _newNode;
          }

          // composite
          y -= 150;
          for (var _i3 = 0; _i3 < this.strComposite.length; _i3++) {
            var _newNode2 = _i3 ? instantiate(this.compositeModeToggle) : this.compositeModeToggle;
            _newNode2.setPosition(x, y - height * _i3, 0.0);
            _newNode2.setScale(0.5, 0.5, 0.5);
            _newNode2.parent = this.compositeModeToggle.parent;
            var _textComponent2 = _newNode2.getComponentInChildren(RichText);
            _textComponent2.string = this.strComposite[_i3];
            this.textComponentList[this.textComponentList.length] = _textComponent2;
            this.textContentList[this.textContentList.length] = _textComponent2.string;
            _newNode2.on(Toggle.EventType.TOGGLE, this.toggleCompositeMode, this);
            this.compositeModeToggleList[_i3] = _newNode2;
          }
        };
        _proto.isTextMatched = function isTextMatched(textUI, textDescription) {
          var tempText = new String(textUI);
          var findIndex = tempText.search('>');
          if (findIndex === -1) {
            return textUI === textDescription;
          } else {
            tempText = tempText.substr(findIndex + 1);
            tempText = tempText.substr(0, tempText.search('<'));
            return tempText === textDescription;
          }
        };
        _proto.toggleSingleMode = function toggleSingleMode(toggle) {
          var debugView = director.root.debugView;
          var textComponent = toggle.getComponentInChildren(RichText);
          for (var i = 0; i < this.strSingle.length; i++) {
            if (this.isTextMatched(textComponent.string, this.strSingle[i])) {
              debugView.singleMode = i;
            }
          }
        };
        _proto.toggleCompositeMode = function toggleCompositeMode(toggle) {
          var debugView = director.root.debugView;
          var textComponent = toggle.getComponentInChildren(RichText);
          for (var i = 0; i < this.strComposite.length; i++) {
            if (this.isTextMatched(textComponent.string, this.strComposite[i])) {
              debugView.enableCompositeMode(i, toggle.isChecked);
            }
          }
        };
        _proto.toggleLightingWithAlbedo = function toggleLightingWithAlbedo(toggle) {
          var debugView = director.root.debugView;
          debugView.lightingWithAlbedo = toggle.isChecked;
        };
        _proto.toggleCSMColoration = function toggleCSMColoration(toggle) {
          var debugView = director.root.debugView;
          debugView.csmLayerColoration = toggle.isChecked;
        };
        _proto.enableAllCompositeMode = function enableAllCompositeMode(button) {
          var debugView = director.root.debugView;
          debugView.enableAllCompositeMode(true);
          for (var i = 0; i < this.compositeModeToggleList.length; i++) {
            var _toggleComponent = this.compositeModeToggleList[i].getComponent(Toggle);
            _toggleComponent.isChecked = true;
          }
          var toggleComponent = this.miscModeToggleList[0].getComponent(Toggle);
          toggleComponent.isChecked = false;
          debugView.csmLayerColoration = false;
          toggleComponent = this.miscModeToggleList[1].getComponent(Toggle);
          toggleComponent.isChecked = true;
          debugView.lightingWithAlbedo = true;
        };
        _proto.hideUI = function hideUI(button) {
          var titleNode = this.node.getChildByName('Titles');
          var activeValue = !titleNode.active;
          this.singleModeToggleList[0].parent.active = activeValue;
          this.miscModeToggleList[0].parent.active = activeValue;
          this.compositeModeToggleList[0].parent.active = activeValue;
          this.EnableAllCompositeModeButton.parent.active = activeValue;
          titleNode.active = activeValue;
          this.hideButtonLabel.string = activeValue ? 'Hide UI' : 'Show UI';
        };
        _proto.changeTextColor = function changeTextColor(button) {
          this._currentColorIndex++;
          if (this._currentColorIndex >= this.strColor.length) {
            this._currentColorIndex = 0;
          }
          for (var i = 0; i < this.textComponentList.length; i++) {
            this.textComponentList[i].string = this.strColor[this._currentColorIndex] + this.textContentList[i] + '</color>';
          }
          for (var _i4 = 0; _i4 < this.labelComponentList.length; _i4++) {
            this.labelComponentList[_i4].color = this.color[this._currentColorIndex];
          }
        };
        _proto.onLoad = function onLoad() {};
        _proto.update = function update(deltaTime) {};
        return DebugViewRuntimeControl;
      }(Component), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "compositeModeToggle", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "singleModeToggle", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "EnableAllCompositeModeButton", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      })), _class2)) || _class));
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/DiamondDisplay.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './CurrencyDisplayBase.ts', './SharedDefines.ts'], function (exports) {
  var _inheritsLoose, cclegacy, _decorator, CurrencyDisplayBase, SharedDefines;
  return {
    setters: [function (module) {
      _inheritsLoose = module.inheritsLoose;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
    }, function (module) {
      CurrencyDisplayBase = module.CurrencyDisplayBase;
    }, function (module) {
      SharedDefines = module.SharedDefines;
    }],
    execute: function () {
      var _dec, _class;
      cclegacy._RF.push({}, "c6775xWko9OV5lSJa7hhwcO", "DiamondDisplay", undefined);
      var ccclass = _decorator.ccclass;
      var DiamondDisplay = exports('DiamondDisplay', (_dec = ccclass('DiamondDisplay'), _dec(_class = /*#__PURE__*/function (_CurrencyDisplayBase) {
        _inheritsLoose(DiamondDisplay, _CurrencyDisplayBase);
        function DiamondDisplay() {
          var _this;
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          _this = _CurrencyDisplayBase.call.apply(_CurrencyDisplayBase, [this].concat(args)) || this;
          _this.eventName = SharedDefines.EVENT_PLAYER_DIAMOND_CHANGE;
          return _this;
        }
        var _proto = DiamondDisplay.prototype;
        _proto.getCurrencyValue = function getCurrencyValue() {
          return this.playerState ? this.playerState.diamond : 0;
        };
        _proto.addCurrency = function addCurrency(amount) {
          if (this.playerState) {
            this.playerState.addDiamond(amount);
          }
        };
        return DiamondDisplay;
      }(CurrencyDisplayBase)) || _class));
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/DragDropComponent.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc'], function (exports) {
  var _applyDecoratedDescriptor, _inheritsLoose, _initializerDefineProperty, _assertThisInitialized, _createForOfIteratorHelperLoose, _createClass, cclegacy, _decorator, Node, Vec2, Vec3, UITransform, Component;
  return {
    setters: [function (module) {
      _applyDecoratedDescriptor = module.applyDecoratedDescriptor;
      _inheritsLoose = module.inheritsLoose;
      _initializerDefineProperty = module.initializerDefineProperty;
      _assertThisInitialized = module.assertThisInitialized;
      _createForOfIteratorHelperLoose = module.createForOfIteratorHelperLoose;
      _createClass = module.createClass;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      Node = module.Node;
      Vec2 = module.Vec2;
      Vec3 = module.Vec3;
      UITransform = module.UITransform;
      Component = module.Component;
    }],
    execute: function () {
      var _dec, _dec2, _class, _class2, _descriptor;
      cclegacy._RF.push({}, "b7f9djSAs1Kj5g9TyHf4RNh", "DragDropComponent", undefined);
      var ccclass = _decorator.ccclass,
        property = _decorator.property;

      // 定义可拖拽对象的接口

      // 定义放置区域的接口

      var DragDropComponent = exports('DragDropComponent', (_dec = ccclass('DragDropComponent'), _dec2 = property({
        type: Node
      }), _dec(_class = (_class2 = /*#__PURE__*/function (_Component) {
        _inheritsLoose(DragDropComponent, _Component);
        function DragDropComponent() {
          var _this;
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          _this = _Component.call.apply(_Component, [this].concat(args)) || this;
          _initializerDefineProperty(_this, "dragContainer", _descriptor, _assertThisInitialized(_this));
          _this.currentDraggingObject = null;
          _this.dropZones = [];
          _this.isDragging = false;
          _this.currentMousePos = new Vec2();
          _this.startDragPosition = new Vec3();
          return _this;
        }
        var _proto = DragDropComponent.prototype;
        _proto.onLoad = function onLoad() {};
        _proto.start = function start() {
          this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
          this.node.on(Node.EventType.MOUSE_MOVE, this.onMouseMove, this);
        };
        _proto.update = function update() {
          if (this.isDragging && this.currentDraggingObject) {
            var mousePos = this.getMousePosition();
            this.currentDraggingObject.onDragging(mousePos);
          }
        };
        _proto.registerDropZone = function registerDropZone(dropZone) {
          //if drop zone is already registered, do nothing
          if (this.dropZones.indexOf(dropZone) !== -1) {
            return;
          }
          this.dropZones.push(dropZone);
        };
        _proto.unregisterDropZone = function unregisterDropZone(dropZone) {
          var index = this.dropZones.indexOf(dropZone);
          if (index !== -1) {
            this.dropZones.splice(index, 1);
          }
        };
        _proto.startDragging = function startDragging(draggable, node) {
          this.currentDraggingObject = draggable;
          this.isDragging = true;
          draggable.onDragStart();
          // 将拖拽对象移动到拖拽容器中，以确保它在最上层
          if (this.dragContainer && node.parent !== this.dragContainer) {
            var worldPos = node.getWorldPosition();
            node.removeFromParent();
            this.dragContainer.addChild(node);
            node.setWorldPosition(worldPos);
          }

          // 立即更新位置到鼠标位置
          var mousePos = this.getMousePosition();
          draggable.onDragging(mousePos);
          this.startDragPosition = node.getWorldPosition();
        };
        _proto.onTouchStart = function onTouchStart(event) {
          if (this.isDragging && this.currentDraggingObject) {
            var _endPosition = event.getUILocation();
            var acceptedDropZone = null;
            for (var _iterator = _createForOfIteratorHelperLoose(this.dropZones), _step; !(_step = _iterator()).done;) {
              var dropZone = _step.value;
              if (dropZone.isPointInside(_endPosition) && dropZone.canAcceptDrop(this.currentDraggingObject)) {
                acceptedDropZone = dropZone;
                break;
              }
            }
            if (acceptedDropZone) {
              var worldPos = acceptedDropZone.getNode().getWorldPosition();
              this.currentDraggingObject.onDragEnd(worldPos, false);
              acceptedDropZone.onDrop(this.currentDraggingObject);
            } else {
              this.currentDraggingObject.onDragEnd(this.startDragPosition, true);
            }
            this.currentDraggingObject = null;
            this.isDragging = false;
            this.startDragPosition = new Vec3();
          }
        };
        _proto.onMouseMove = function onMouseMove(event) {
          this.currentMousePos = event.getUILocation();
        };
        _proto.getMousePosition = function getMousePosition() {
          var mousePos = this.currentMousePos;
          return this.dragContainer ? this.dragContainer.getComponent(UITransform).convertToNodeSpaceAR(new Vec3(mousePos.x, mousePos.y, 0)) : this.node.getComponent(UITransform).convertToNodeSpaceAR(new Vec3(mousePos.x, mousePos.y, 0));
        };
        _proto.onDestroy = function onDestroy() {
          //director.getScene()!.off(Node.EventType.TOUCH_START, this.onTouchStart, this);
          this.node.off(Node.EventType.TOUCH_START, this.onTouchStart, this);
          this.node.off(Node.EventType.MOUSE_MOVE, this.onMouseMove, this);
        };
        _createClass(DragDropComponent, [{
          key: "IsDragging",
          get:
          //getter isdragging
          function get() {
            return this.isDragging;
          }
        }]);
        return DragDropComponent;
      }(Component), _descriptor = _applyDecoratedDescriptor(_class2.prototype, "dragContainer", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _class2)) || _class));
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/FarmFactoryWindow.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './WindowBase.ts', './SyntheDataManager.ts', './InventoryComponent.ts', './ResourceManager.ts', './SharedDefines.ts', './WindowManager.ts', './ItemDataManager.ts', './NetworkManager.ts'], function (exports) {
  var _applyDecoratedDescriptor, _inheritsLoose, _initializerDefineProperty, _assertThisInitialized, _asyncToGenerator, _regeneratorRuntime, cclegacy, _decorator, Label, Node, Button, ScrollView, Sprite, instantiate, SpriteFrame, WindowBase, SyntheDataManager, InventoryItem, ResourceManager, SyntheState, SharedDefines, WindowManager, ItemDataManager, NetworkManager;
  return {
    setters: [function (module) {
      _applyDecoratedDescriptor = module.applyDecoratedDescriptor;
      _inheritsLoose = module.inheritsLoose;
      _initializerDefineProperty = module.initializerDefineProperty;
      _assertThisInitialized = module.assertThisInitialized;
      _asyncToGenerator = module.asyncToGenerator;
      _regeneratorRuntime = module.regeneratorRuntime;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      Label = module.Label;
      Node = module.Node;
      Button = module.Button;
      ScrollView = module.ScrollView;
      Sprite = module.Sprite;
      instantiate = module.instantiate;
      SpriteFrame = module.SpriteFrame;
    }, function (module) {
      WindowBase = module.WindowBase;
    }, function (module) {
      SyntheDataManager = module.SyntheDataManager;
    }, function (module) {
      InventoryItem = module.InventoryItem;
    }, function (module) {
      ResourceManager = module.ResourceManager;
    }, function (module) {
      SyntheState = module.SyntheState;
      SharedDefines = module.SharedDefines;
    }, function (module) {
      WindowManager = module.WindowManager;
    }, function (module) {
      ItemDataManager = module.ItemDataManager;
    }, function (module) {
      NetworkManager = module.NetworkManager;
    }],
    execute: function () {
      var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5;
      cclegacy._RF.push({}, "e923eotFYFCGJaRI2kBuj3e", "FarmFactoryWindow", undefined);
      var ccclass = _decorator.ccclass,
        property = _decorator.property;
      var FarmFactoryWindow = exports('FarmFactoryWindow', (_dec = ccclass('FarmFactoryWindow'), _dec2 = property(Label), _dec3 = property(Node), _dec4 = property(Button), _dec5 = property(Button), _dec6 = property(ScrollView), _dec(_class = (_class2 = /*#__PURE__*/function (_WindowBase) {
        _inheritsLoose(FarmFactoryWindow, _WindowBase);
        function FarmFactoryWindow() {
          var _this;
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          _this = _WindowBase.call.apply(_WindowBase, [this].concat(args)) || this;
          _initializerDefineProperty(_this, "lbTitle", _descriptor, _assertThisInitialized(_this));
          //define a item node
          _initializerDefineProperty(_this, "itemTemplate", _descriptor2, _assertThisInitialized(_this));
          //btnClose
          _initializerDefineProperty(_this, "btnClose", _descriptor3, _assertThisInitialized(_this));
          //btnUpgrade
          _initializerDefineProperty(_this, "btnUpgrade", _descriptor4, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "scrollView", _descriptor5, _assertThisInitialized(_this));
          _this.currentBuilding = null;
          _this.inventoryComponent = null;
          return _this;
        }
        var _proto = FarmFactoryWindow.prototype;
        //override
        _proto.initialize = function initialize() {
          _WindowBase.prototype.initialize.call(this);
          this.btnClose.node.on(Button.EventType.CLICK, this.onBtnCloseClick, this);
          this.btnUpgrade.node.on(Button.EventType.CLICK, this.onBtnUpgradeClick, this);
          this.itemTemplate.active = false;
          this.inventoryComponent = this.gameController.getPlayerController().inventoryComponent;
        }

        //override
        ;

        _proto.show = function show() {
          var _WindowBase$prototype;
          for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            args[_key2] = arguments[_key2];
          }
          (_WindowBase$prototype = _WindowBase.prototype.show).call.apply(_WindowBase$prototype, [this].concat(args));
          this.currentBuilding = args[0];
          this.lbTitle.string = this.currentBuilding.BuildingData.description;
          console.log("FarmFactoryWindow show buildingId: " + this.currentBuilding.id);
          this.getSceneSyntheDataListFromServer(this.currentBuilding.SceneItem.id, this.currentBuilding.id);
        };
        _proto.getSceneSyntheDataListFromServer = /*#__PURE__*/function () {
          var _getSceneSyntheDataListFromServer = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(sceneId, buildingId) {
            var result, sceneSyntheDataList, syntheDatas;
            return _regeneratorRuntime().wrap(function _callee$(_context) {
              while (1) switch (_context.prev = _context.next) {
                case 0:
                  _context.next = 2;
                  return NetworkManager.instance.querySceneSyntheList(sceneId);
                case 2:
                  result = _context.sent;
                  if (result && result.success) {
                    sceneSyntheDataList = result.data;
                    syntheDatas = SyntheDataManager.instance.filterSyntheDataByBuild(buildingId);
                    this.updateScrollView(sceneSyntheDataList, syntheDatas);
                  }
                case 4:
                case "end":
                  return _context.stop();
              }
            }, _callee, this);
          }));
          function getSceneSyntheDataListFromServer(_x, _x2) {
            return _getSceneSyntheDataListFromServer.apply(this, arguments);
          }
          return getSceneSyntheDataListFromServer;
        }();
        _proto.updateScrollView = function updateScrollView(sceneSyntheDataList, syntheDatas) {
          var _this2 = this;
          console.log("updateScrollView: start...");
          this.clearScrollViewContent();
          // Add a delay of 0.1 seconds before populating items
          this.scheduleOnce(function () {
            _this2.populateInProgressItems(sceneSyntheDataList);
            _this2.populateAvailableItems(syntheDatas, sceneSyntheDataList);
          }, 0.1);

          // // Remove the direct calls to these methods
          // // this.populateInProgressItems(sceneSyntheDataList);
          // // this.populateAvailableItems(syntheDatas,sceneSyntheDataList);
          // this.populateInProgressItems(sceneSyntheDataList);
          // //log all syntheDatas & sceneSyntheDataList
          // console.log(`syntheDatas:`,syntheDatas);
          // console.log(`sceneSyntheDataList:`,sceneSyntheDataList);
          // this.populateAvailableItems(syntheDatas,sceneSyntheDataList);
        };

        _proto.clearScrollViewContent = function clearScrollViewContent() {
          var _this3 = this;
          console.log("clearScrollViewContent: start...");
          var content = this.scrollView.content;
          if (content) {
            content.children.forEach(function (child) {
              if (child !== _this3.itemTemplate) {
                child.destroy();
              }
            });
          }
        };
        _proto.populateInProgressItems = function populateInProgressItems(sceneSyntheDataList) {
          var _this4 = this;
          console.log("populateInProgressItems: start...");
          sceneSyntheDataList.forEach( /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2(item) {
            var itemNode;
            return _regeneratorRuntime().wrap(function _callee2$(_context2) {
              while (1) switch (_context2.prev = _context2.next) {
                case 0:
                  _context2.next = 2;
                  return _this4.createInProgressItemNode(item);
                case 2:
                  itemNode = _context2.sent;
                  _this4.scrollView.content.addChild(itemNode);
                case 4:
                case "end":
                  return _context2.stop();
              }
            }, _callee2);
          })));
        };
        _proto.createInProgressItemNode = /*#__PURE__*/function () {
          var _createInProgressItemNode = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee3(item) {
            var itemNode, syntheData;
            return _regeneratorRuntime().wrap(function _callee3$(_context3) {
              while (1) switch (_context3.prev = _context3.next) {
                case 0:
                  itemNode = instantiate(this.itemTemplate);
                  itemNode.active = true;
                  syntheData = SyntheDataManager.instance.findSyntheDataById(item.syntheid);
                  if (syntheData) {
                    _context3.next = 6;
                    break;
                  }
                  console.error("Synthe data not found for id: " + item.syntheid);
                  return _context3.abrupt("return", itemNode);
                case 6:
                  _context3.next = 8;
                  return this.setupTargetItem(itemNode, syntheData);
                case 8:
                  this.setupSourceItems(itemNode, syntheData);
                  this.setupInProgressStatus(itemNode, item);
                  this.setupItemButtons(itemNode, syntheData, item.state);
                  return _context3.abrupt("return", itemNode);
                case 12:
                case "end":
                  return _context3.stop();
              }
            }, _callee3, this);
          }));
          function createInProgressItemNode(_x4) {
            return _createInProgressItemNode.apply(this, arguments);
          }
          return createInProgressItemNode;
        }();
        _proto.setupInProgressStatus = function setupInProgressStatus(itemNode, item) {
          itemNode.name = item.id;
          var txtRemainingTime = itemNode.getChildByName('txtRemainingTime').getComponent(Label);
          var btnSynthesisEnd = itemNode.getChildByName('btnSynthesisEnd').getComponent(Button);
          txtRemainingTime.node.active = true;
          var endTime = new Date(item.endTime);
          var remainingTime = Math.max(0, (endTime.getTime() - Date.now()) / 1000);
          console.log("setupInProgressStatus:remainingTime:" + remainingTime);
          this.updateRemainingTime(txtRemainingTime, btnSynthesisEnd, remainingTime);
        };
        _proto.populateAvailableItems = function populateAvailableItems(syntheDatas, sceneSyntheDataList) {
          var _this5 = this;
          var availableSyntheDatas = this.filterAvailableSyntheDatas(syntheDatas, sceneSyntheDataList);
          //log all availableSyntheDatas
          console.log("availableSyntheDatas:", availableSyntheDatas);
          availableSyntheDatas.forEach( /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee4(data) {
            var itemNode;
            return _regeneratorRuntime().wrap(function _callee4$(_context4) {
              while (1) switch (_context4.prev = _context4.next) {
                case 0:
                  _context4.next = 2;
                  return _this5.createAvailableItemNode(data);
                case 2:
                  itemNode = _context4.sent;
                  _this5.scrollView.content.addChild(itemNode);
                case 4:
                case "end":
                  return _context4.stop();
              }
            }, _callee4);
          })));
        };
        _proto.filterAvailableSyntheDatas = function filterAvailableSyntheDatas(syntheDatas, sceneSyntheDataList) {
          var inProgressIds = new Set(sceneSyntheDataList.map(function (item) {
            return item.syntheid;
          }));
          return syntheDatas.filter(function (data) {
            return !inProgressIds.has(data.id);
          });
        };
        _proto.createAvailableItemNode = /*#__PURE__*/function () {
          var _createAvailableItemNode = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee5(data) {
            var itemNode;
            return _regeneratorRuntime().wrap(function _callee5$(_context5) {
              while (1) switch (_context5.prev = _context5.next) {
                case 0:
                  itemNode = instantiate(this.itemTemplate);
                  itemNode.active = true;
                  _context5.next = 4;
                  return this.setupTargetItem(itemNode, data);
                case 4:
                  this.setupSourceItems(itemNode, data);
                  this.setupItemButtons(itemNode, data);
                  return _context5.abrupt("return", itemNode);
                case 7:
                case "end":
                  return _context5.stop();
              }
            }, _callee5, this);
          }));
          function createAvailableItemNode(_x6) {
            return _createAvailableItemNode.apply(this, arguments);
          }
          return createAvailableItemNode;
        }();
        _proto.setupTargetItem = /*#__PURE__*/function () {
          var _setupTargetItem = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee6(itemNode, data) {
            var sprTarget, txtTargetName, txtRemainingTime, targetItem;
            return _regeneratorRuntime().wrap(function _callee6$(_context6) {
              while (1) switch (_context6.prev = _context6.next) {
                case 0:
                  sprTarget = itemNode.getChildByName('sprTarget').getComponent(Sprite);
                  txtTargetName = itemNode.getChildByName('txtTargetName').getComponent(Label);
                  txtRemainingTime = itemNode.getChildByName('txtRemainingTime').getComponent(Label);
                  targetItem = ItemDataManager.instance.getItemById(data.synthe_item_id);
                  txtRemainingTime.node.active = false;
                  _context6.next = 7;
                  return this.loadTargetSprite(sprTarget, targetItem);
                case 7:
                  txtTargetName.string = data.description;
                case 8:
                case "end":
                  return _context6.stop();
              }
            }, _callee6, this);
          }));
          function setupTargetItem(_x7, _x8) {
            return _setupTargetItem.apply(this, arguments);
          }
          return setupTargetItem;
        }();
        _proto.loadTargetSprite = /*#__PURE__*/function () {
          var _loadTargetSprite = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee7(sprTarget, targetItem) {
            var spriteFrame;
            return _regeneratorRuntime().wrap(function _callee7$(_context7) {
              while (1) switch (_context7.prev = _context7.next) {
                case 0:
                  if (sprTarget) {
                    _context7.next = 3;
                    break;
                  }
                  console.error("sprTarget is null");
                  return _context7.abrupt("return");
                case 3:
                  _context7.next = 5;
                  return ResourceManager.instance.loadAsset("" + SharedDefines.WINDOW_SHOP_TEXTURES + targetItem.png + "/spriteFrame", SpriteFrame);
                case 5:
                  spriteFrame = _context7.sent;
                  if (spriteFrame && sprTarget) {
                    sprTarget.spriteFrame = spriteFrame;
                  }
                case 7:
                case "end":
                  return _context7.stop();
              }
            }, _callee7);
          }));
          function loadTargetSprite(_x9, _x10) {
            return _loadTargetSprite.apply(this, arguments);
          }
          return loadTargetSprite;
        }();
        _proto.setupSourceItems = function setupSourceItems(itemNode, data) {
          var _this6 = this;
          var formulas = data.formula_1;
          var qualities = data.quality;
          var sources = [itemNode.getChildByName('source'), itemNode.getChildByName('source2'), itemNode.getChildByName('source3')];
          var plusSprites = [itemNode.getChildByName('sprPlus').getComponent(Sprite), itemNode.getChildByName('sprPlus2').getComponent(Sprite)];
          if (!formulas || formulas.length == 0) {
            console.error("formulas is null or empty");
            return;
          }
          formulas.forEach( /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee8(formula, index) {
            return _regeneratorRuntime().wrap(function _callee8$(_context8) {
              while (1) switch (_context8.prev = _context8.next) {
                case 0:
                  if (!(index < sources.length)) {
                    _context8.next = 5;
                    break;
                  }
                  _context8.next = 3;
                  return _this6.setSourceData(sources[index], formula, qualities[index]);
                case 3:
                  sources[index].active = true;
                  if (index > 0 && index - 1 < plusSprites.length) {
                    plusSprites[index - 1].node.active = true;
                  }
                case 5:
                case "end":
                  return _context8.stop();
              }
            }, _callee8);
          })));

          // Hide unused sources and plus sprites
          for (var i = formulas.length; i < sources.length; i++) {
            sources[i].active = false;
            if (i > 0 && i - 1 < plusSprites.length) {
              plusSprites[i - 1].node.active = false;
            }
          }
        };
        _proto.setSourceData = /*#__PURE__*/function () {
          var _setSourceData = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee9(sourceNode, sourceItemId, quality) {
            var txtName, sourceSprite, item, spriteFrame;
            return _regeneratorRuntime().wrap(function _callee9$(_context9) {
              while (1) switch (_context9.prev = _context9.next) {
                case 0:
                  txtName = sourceNode.getChildByName('txtName').getComponent(Label);
                  sourceSprite = sourceNode.getComponent(Sprite);
                  if (sourceSprite) {
                    _context9.next = 5;
                    break;
                  }
                  console.error("sourceSprite is null , sourceNode name: " + sourceNode.name);
                  return _context9.abrupt("return");
                case 5:
                  item = ItemDataManager.instance.getItemById(sourceItemId);
                  txtName.string = item.description + "x" + quality;
                  _context9.next = 9;
                  return ResourceManager.instance.loadAsset("" + SharedDefines.WINDOW_SHOP_TEXTURES + item.png + "/spriteFrame", SpriteFrame);
                case 9:
                  spriteFrame = _context9.sent;
                  if (spriteFrame && sourceSprite) {
                    sourceSprite.spriteFrame = spriteFrame;
                  }
                case 11:
                case "end":
                  return _context9.stop();
              }
            }, _callee9);
          }));
          function setSourceData(_x13, _x14, _x15) {
            return _setSourceData.apply(this, arguments);
          }
          return setSourceData;
        }();
        _proto.setupItemButtons = function setupItemButtons(itemNode, data, state) {
          var _this7 = this;
          if (state === void 0) {
            state = SyntheState.None;
          }
          var btnStart = itemNode.getChildByName('btnStart').getComponent(Button);
          var btnSynthesisEnd = itemNode.getChildByName('btnSynthesisEnd').getComponent(Button);
          var hasEnoughItems = this.checkInventory(data);
          btnStart.node.active = hasEnoughItems && state != SyntheState.Complete;
          btnStart.node.on(Button.EventType.CLICK, function () {
            _this7.onBtnStartClick(data, itemNode);
          });
          btnSynthesisEnd.node.active = state == SyntheState.InProgress;
          btnSynthesisEnd.node.on(Button.EventType.CLICK, function () {
            _this7.onBtnSynthesisEndClick(data, itemNode);
          });
        };
        _proto.checkInventory = function checkInventory(data) {
          var inventoryItems = this.inventoryComponent.getAllItems();
          //log all inventory items
          console.log("inventoryItems:", inventoryItems);
          var formulas = data.formula_1;
          var qualities = data.quality;
          return formulas.every(function (source, index) {
            var item = inventoryItems.find(function (item) {
              return item.id === source;
            });
            return item && item.quantity >= parseInt(qualities[index]);
          });
        };
        _proto.startSynthesisTimer = function startSynthesisTimer(totalTime, txtRemainingTime, btnSynthesisEnd, onComplete) {
          var _this8 = this;
          var remainingTime = totalTime;
          var updateTimer = function updateTimer() {
            if (remainingTime > 0) {
              remainingTime -= 1;
              var minutes = Math.floor(remainingTime / 60);
              txtRemainingTime.string = "\u5269\u4F59" + minutes + "\u5206\u949F";
            } else {
              _this8.unschedule(updateTimer);
              onComplete();
              txtRemainingTime.node.active = false;
              btnSynthesisEnd.node.active = true;
            }
          };

          // Update immediately and then every minute
          updateTimer();
          this.schedule(updateTimer, 60);
        };
        _proto.onBtnStartClick = /*#__PURE__*/function () {
          var _onBtnStartClick = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee10(data, itemNode) {
            var _this9 = this;
            var txtRemainingTime, btnSynthesisEnd, btnStart, result, sceneSyntheData;
            return _regeneratorRuntime().wrap(function _callee10$(_context10) {
              while (1) switch (_context10.prev = _context10.next) {
                case 0:
                  // Handle button click event
                  console.log("Crafting " + data.name + " with formula " + data.formula_1 + " , itemNode name: " + itemNode.name);
                  txtRemainingTime = itemNode.getChildByName('txtRemainingTime').getComponent(Label);
                  btnSynthesisEnd = itemNode.getChildByName('btnSynthesisEnd').getComponent(Button);
                  btnStart = itemNode.getChildByName('btnStart').getComponent(Button);
                  console.log("data.time_min:", data.time_min);
                  this.updateRemainingTime(txtRemainingTime, btnStart, data.time_min * SharedDefines.TIME_MINUTE);
                  btnStart.node.active = false;
                  btnSynthesisEnd.node.active = false;
                  txtRemainingTime.node.active = true;
                  txtRemainingTime.string = "\u5269\u4F59" + data.time_min + "\u5206\u949F";
                  _context10.next = 12;
                  return NetworkManager.instance.syntheStart(data.id, this.currentBuilding.SceneItem.id);
                case 12:
                  result = _context10.sent;
                  if (result && result.success) {
                    console.log("Synthesis start success");
                    sceneSyntheData = result.data;
                    itemNode.name = sceneSyntheData.id;
                    data.formula_1.forEach(function (source, index) {
                      var item = _this9.inventoryComponent.getItem(source);
                      if (item) {
                        _this9.inventoryComponent.removeItem(item.id);
                      }
                    });
                  } else {
                    console.log("Synthesis start failed");
                  }
                case 14:
                case "end":
                  return _context10.stop();
              }
            }, _callee10, this);
          }));
          function onBtnStartClick(_x16, _x17) {
            return _onBtnStartClick.apply(this, arguments);
          }
          return onBtnStartClick;
        }();
        _proto.onBtnSynthesisEndClick = /*#__PURE__*/function () {
          var _onBtnSynthesisEndClick = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee11(data, itemNode) {
            var result, syntheData, syntheItem, inventoryItem;
            return _regeneratorRuntime().wrap(function _callee11$(_context11) {
              while (1) switch (_context11.prev = _context11.next) {
                case 0:
                  console.log("Synthesis completed after " + data.time_min + " minutes");
                  _context11.next = 3;
                  return NetworkManager.instance.syntheEnd(this.currentBuilding.SceneItem.id, itemNode.name);
                case 3:
                  result = _context11.sent;
                  if (result && result.success) {
                    console.log("Synthesis end success");
                    syntheData = SyntheDataManager.instance.findSyntheDataById(result.data.syntheid);
                    syntheItem = ItemDataManager.instance.getItemById(syntheData.synthe_item_id);
                    inventoryItem = new InventoryItem(syntheItem, 1);
                    this.inventoryComponent.addItem(inventoryItem);
                    this.refreshData();
                  } else {
                    console.log("Synthesis end failed");
                  }
                case 5:
                case "end":
                  return _context11.stop();
              }
            }, _callee11, this);
          }));
          function onBtnSynthesisEndClick(_x18, _x19) {
            return _onBtnSynthesisEndClick.apply(this, arguments);
          }
          return onBtnSynthesisEndClick;
        }();
        _proto.onBtnUpgradeClick = function onBtnUpgradeClick(event) {
          console.log('Upgrade button clicked');
        };
        _proto.onBtnCloseClick = function onBtnCloseClick(event) {
          WindowManager.instance.hide(SharedDefines.WINDOW_FARM_FACTORY_NAME);
        };
        _proto.updateRemainingTime = function updateRemainingTime(label, btnSynthesisEnd, remainingSeconds) {
          var _this10 = this;
          var minutes = Math.floor(remainingSeconds / 60);
          label.string = "\u5269\u4F59" + minutes + "\u5206\u949F";
          if (remainingSeconds > 0) {
            this.scheduleOnce(function () {
              _this10.updateRemainingTime(label, btnSynthesisEnd, remainingSeconds - 60);
            }, 60);
          } else {
            label.node.active = false;
            btnSynthesisEnd.node.active = true;
            // 可能需要刷新数据或更新UI
            //this.refreshData();
          }
        };

        _proto.refreshData = function refreshData() {
          // 重新获取数据并更新UI
          this.getSceneSyntheDataListFromServer(this.currentBuilding.SceneItem.id, this.currentBuilding.id);
        };
        return FarmFactoryWindow;
      }(WindowBase), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "lbTitle", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "itemTemplate", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "btnClose", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "btnUpgrade", [_dec5], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "scrollView", [_dec6], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      })), _class2)) || _class));
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/FarmSelectionWindow.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './WindowBase.ts', './InventoryComponent.ts', './SharedDefines.ts', './ResourceManager.ts', './Fence.ts', './WindowManager.ts', './UIHelper.ts', './UIEffectHelper.ts', './CoinCollectionEffectComponent.ts'], function (exports) {
  var _applyDecoratedDescriptor, _inheritsLoose, _initializerDefineProperty, _assertThisInitialized, _asyncToGenerator, _regeneratorRuntime, cclegacy, _decorator, Node, ScrollView, Button, Prefab, Sprite, Vec3, instantiate, SpriteFrame, WindowBase, ItemType, FarmSelectionType, SharedDefines, CommandType, InteractionMode, ResourceManager, Fence, WindowManager, UIHelper, UIEffectHelper, CoinType;
  return {
    setters: [function (module) {
      _applyDecoratedDescriptor = module.applyDecoratedDescriptor;
      _inheritsLoose = module.inheritsLoose;
      _initializerDefineProperty = module.initializerDefineProperty;
      _assertThisInitialized = module.assertThisInitialized;
      _asyncToGenerator = module.asyncToGenerator;
      _regeneratorRuntime = module.regeneratorRuntime;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      Node = module.Node;
      ScrollView = module.ScrollView;
      Button = module.Button;
      Prefab = module.Prefab;
      Sprite = module.Sprite;
      Vec3 = module.Vec3;
      instantiate = module.instantiate;
      SpriteFrame = module.SpriteFrame;
    }, function (module) {
      WindowBase = module.WindowBase;
    }, function (module) {
      ItemType = module.ItemType;
    }, function (module) {
      FarmSelectionType = module.FarmSelectionType;
      SharedDefines = module.SharedDefines;
      CommandType = module.CommandType;
      InteractionMode = module.InteractionMode;
    }, function (module) {
      ResourceManager = module.ResourceManager;
    }, function (module) {
      Fence = module.Fence;
    }, function (module) {
      WindowManager = module.WindowManager;
    }, function (module) {
      UIHelper = module.UIHelper;
    }, function (module) {
      UIEffectHelper = module.UIEffectHelper;
    }, function (module) {
      CoinType = module.CoinType;
    }],
    execute: function () {
      var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _class2, _class3, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor10, _descriptor11, _descriptor12;
      cclegacy._RF.push({}, "9d06emflENHBp2H9wlYuOUX", "FarmSelectionWindow", undefined);
      //TODO move to touch location when shown

      var ccclass = _decorator.ccclass,
        property = _decorator.property;
      var OperationTargetType = /*#__PURE__*/function (OperationTargetType) {
        OperationTargetType[OperationTargetType["None"] = 0] = "None";
        OperationTargetType[OperationTargetType["Crop"] = 1] = "Crop";
        OperationTargetType[OperationTargetType["Animal"] = 2] = "Animal";
        return OperationTargetType;
      }(OperationTargetType || {});
      var DragOperation = /*#__PURE__*/function () {
        function DragOperation(targetType, operation, dragNode, targetNode) {
          this.targetType = OperationTargetType.None;
          this.operation = CommandType.None;
          this.dragNode = null;
          this.targetNode = null;
          this.targetType = targetType;
          this.operation = operation;
          this.dragNode = dragNode;
          this.targetNode = targetNode;
        }
        var _proto = DragOperation.prototype;
        _proto.reset = function reset() {
          this.targetType = OperationTargetType.None;
          this.operation = CommandType.None;
          this.dragNode = null;
          this.targetNode = null;
        };
        return DragOperation;
      }();
      var FarmSelectionWindow = exports('FarmSelectionWindow', (_dec = ccclass('FarmSelectionWindow'), _dec2 = property(Node), _dec3 = property(ScrollView), _dec4 = property(Node), _dec5 = property(Node), _dec6 = property(Button), _dec7 = property(Button), _dec8 = property(Button), _dec9 = property(Button), _dec10 = property(Button), _dec11 = property(Button), _dec12 = property(Prefab), _dec13 = property(Sprite), _dec(_class2 = (_class3 = /*#__PURE__*/function (_WindowBase) {
        _inheritsLoose(FarmSelectionWindow, _WindowBase);
        function FarmSelectionWindow() {
          var _this;
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          _this = _WindowBase.call.apply(_WindowBase, [this].concat(args)) || this;
          _initializerDefineProperty(_this, "selectionNode", _descriptor, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "scrollView", _descriptor2, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "plotCommandNode", _descriptor3, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "animalCommandNode", _descriptor4, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "btnCropCare", _descriptor5, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "btnCropTreat", _descriptor6, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "btnCropCleanse", _descriptor7, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "btnAnimalCare", _descriptor8, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "btnAnimalTreat", _descriptor9, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "btnAnimalCleanse", _descriptor10, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "itemPrefab", _descriptor11, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "operationSprite", _descriptor12, _assertThisInitialized(_this));
          _this.clickLocation = null;
          _this.currentSelectionType = FarmSelectionType.NONE;
          _this.currentSelectionNode = null;
          //#region drag and operation
          _this.dragOperation = null;
          //#endregion
          _this.fence = null;
          _this.playerController = null;
          _this.inventoryComponent = null;
          _this.callback = null;
          _this.collectingDiamondRefCount = 0;
          _this.canHide = true;
          return _this;
        }
        var _proto2 = FarmSelectionWindow.prototype;
        // private currentPlotTile: PlotTile | null = null;
        _proto2.initialize = function initialize() {
          _WindowBase.prototype.initialize.call(this);
          this.playerController = this.gameController.getPlayerController();
          this.inventoryComponent = this.playerController.inventoryComponent;
          this.btnCropTreat.node.on(Button.EventType.CLICK, this.onTreat, this);
          this.btnCropCleanse.node.on(Button.EventType.CLICK, this.onCleanse, this);
          this.btnAnimalCare.node.on(Button.EventType.CLICK, this.onCare, this);
          this.btnAnimalTreat.node.on(Button.EventType.CLICK, this.onTreat, this);
          this.btnAnimalCleanse.node.on(Button.EventType.CLICK, this.onCleanse, this);
        };
        _proto2.show = function show() {
          var _WindowBase$prototype,
            _this2 = this;
          for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            args[_key2] = arguments[_key2];
          }
          (_WindowBase$prototype = _WindowBase.prototype.show).call.apply(_WindowBase$prototype, [this].concat(args));
          if (args.length === 0) {
            console.log("FarmSelectionWindow: no arguments passed");
            return;
          }
          this.currentSelectionType = args[0];
          this.currentSelectionNode = args[1];
          this.clickLocation = args[2];
          this.callback = args[3];
          this.collectingDiamondRefCount = 0;
          this.canHide = true;
          this.operationSprite.node.active = false;

          //set selection node active true
          this.selectionNode.active = true;
          this.selectionNode.setWorldPosition(new Vec3(this.clickLocation.x, this.clickLocation.y, 0));
          this.updateFarmSelectionViewVisibilityByType(this.currentSelectionType);
          if (this.currentSelectionType === FarmSelectionType.PLOT) {
            var animations = this.getItemsByType(ItemType.CROPSEED);
            console.log("crop seed count: " + animations.length);
            this.updateScrollView(animations);
          } else if (this.currentSelectionType === FarmSelectionType.FENCE) {
            this.fence = this.currentSelectionNode.getComponent(Fence);
            var _animations = this.getItemsByType(ItemType.ANIMALCUB);
            console.log("animation count: " + _animations.length);
            this.updateScrollView(_animations);
          }
          this.scheduleOnce(function () {
            _this2.setupEventListeners();
          }, 1);
        };
        _proto2.setupEventListeners = function setupEventListeners() {
          this.playerController.inputComponent.eventTarget.on(SharedDefines.EVENT_CLICK, this.onClick, this);
          this.playerController.inputComponent.eventTarget.on(SharedDefines.EVENT_TOUCH_MOVE, this.onTouchMove, this);
          this.playerController.inputComponent.eventTarget.on(SharedDefines.EVENT_TOUCH_END, this.onTouchEnd, this);
        };
        _proto2.removeEventListeners = function removeEventListeners() {
          this.playerController.inputComponent.eventTarget.off(SharedDefines.EVENT_CLICK, this.onClick, this);
          this.playerController.inputComponent.eventTarget.off(SharedDefines.EVENT_TOUCH_MOVE, this.onTouchMove, this);
          this.playerController.inputComponent.eventTarget.off(SharedDefines.EVENT_TOUCH_END, this.onTouchEnd, this);
        };
        _proto2.hide = function hide() {
          if (!this.canHide || this.collectingDiamondRefCount > 0) {
            return;
          }
          console.log("hide FarmSelectionWindow");
          _WindowBase.prototype.hide.call(this);
          this.callback = null;
          this.removeEventListeners();
        };
        _proto2.updateFarmSelectionViewVisibilityByType = function updateFarmSelectionViewVisibilityByType(type) {
          console.log("updateFarmSelectionViewVisibilityByType: " + type);
          if (type === FarmSelectionType.PLOT || type === FarmSelectionType.FENCE) {
            this.scrollView.node.active = true;
            this.plotCommandNode.active = false;
            this.animalCommandNode.active = false;
            console.log("Show scroll view");
          } else if (type === FarmSelectionType.PLOT_COMMAND) {
            this.scrollView.node.active = false;
            this.plotCommandNode.active = true;
            this.animalCommandNode.active = false;
            console.log("Show plot command");
          } else if (type === FarmSelectionType.ANIMAL_COMMAND) {
            this.scrollView.node.active = false;
            this.plotCommandNode.active = false;
            this.animalCommandNode.active = true;
            console.log("Show animal command");
          }
        }

        //#region handle touch events
        ;

        _proto2.onClick = function onClick(event) {
          console.log("FarmSelectionWindow: onClick");
          if (!this.selectionNode.activeInHierarchy) {
            return;
          }
          //get world position of touch
          var worldPosition = event.getUILocation();
          if (this.btnCropCare.node.activeInHierarchy && UIHelper.isPointInUINode(worldPosition, this.btnCropCare.node) || this.btnAnimalCare.node.activeInHierarchy && UIHelper.isPointInUINode(worldPosition, this.btnAnimalCare.node)) {
            this.onCare();
          } else if (this.btnCropTreat.node.activeInHierarchy && UIHelper.isPointInUINode(worldPosition, this.btnCropTreat.node) || this.btnAnimalTreat.node.activeInHierarchy && UIHelper.isPointInUINode(worldPosition, this.btnAnimalTreat.node)) {
            this.onTreat();
          } else if (this.btnCropCleanse.node.activeInHierarchy && UIHelper.isPointInUINode(worldPosition, this.btnCropCleanse.node) || this.btnAnimalCleanse.node.activeInHierarchy && UIHelper.isPointInUINode(worldPosition, this.btnAnimalCleanse.node)) {
            this.onCleanse();
          }
        };
        _proto2.onTouchMove = function onTouchMove(event) {
          //console.log("FarmSelectionWindow: onTouchMove");
          //get world position of touch
          var worldPosition = event.getUILocation();
          if (!this.dragOperation) {
            this.initializeDragOperation(worldPosition);
          } else if (this.dragOperation && this.dragOperation.dragNode && this.dragOperation.operation !== CommandType.None) {
            //update current drag target position
            this.dragOperation.dragNode.setWorldPosition(new Vec3(worldPosition.x, worldPosition.y, 0));
            //if selection node is active, set it to inactive
            if (this.selectionNode.active) {
              this.selectionNode.active = false;
            }
            if (this.dragOperation.targetType === OperationTargetType.Crop) {
              this.handleCropDragOperation();
            } else if (this.dragOperation.targetType === OperationTargetType.Animal) {
              this.handleAnimalDragOperation();
            }
          }
        };
        _proto2.onTouchEnd = function onTouchEnd(event) {
          console.log("FarmSelectionWindow: onTouchEnd");
          this.playerController.interactionMode = InteractionMode.CameraDrag;
          this.canHide = true;
          this.hide();
          this.dragOperation = null;
        }

        //#endregion

        //#region handle shop items
        ;

        _proto2.updateScrollView = function updateScrollView(items) {
          var _this3 = this;
          if (!this.scrollView || !this.itemPrefab) return;
          this.scrollView.content.removeAllChildren();
          var itemCount = Math.min(items.length, 5);

          // 设置 ScrollView 的大小
          // const scrollViewHeight = itemCount * 110;
          // const uiTransform = this.scrollView.node.getComponent(UITransform);
          // if (uiTransform) {
          //     uiTransform.height = scrollViewHeight;
          // }

          // 禁用或启用滚动
          this.scrollView.vertical = items.length > 1;
          items.forEach(function (seed) {
            return _this3.createItem(seed.iconName, seed);
          });
        };
        _proto2.getItemsByType = function getItemsByType(itemType) {
          var _this$inventoryCompon;
          var itemTypeNumber = itemType;
          return ((_this$inventoryCompon = this.inventoryComponent) == null ? void 0 : _this$inventoryCompon.getAllItems().filter(function (item) {
            return item.itemType === itemTypeNumber.toString();
          })) || [];
        };
        _proto2.createItem = function createItem(textureName, data) {
          var _this4 = this;
          if (data === void 0) {
            data = null;
          }
          var itemNode = instantiate(this.itemPrefab);
          var sprite = itemNode.getComponent(Sprite);
          var button = itemNode.getComponent(Button);
          if (sprite) {
            ResourceManager.instance.loadAsset("" + SharedDefines.WINDOW_SHOP_TEXTURES + textureName + "/spriteFrame", SpriteFrame).then(function (spriteFrame) {
              if (spriteFrame) {
                sprite.spriteFrame = spriteFrame;
              }
            });
          }
          if (button) {
            button.node.on(Button.EventType.CLICK, function () {
              return _this4.onItemSelected(data);
            }, this);
          }
          this.scrollView.content.addChild(itemNode);
        }

        //#endregion

        //#region handle button click
        ;

        _proto2.onCare = /*#__PURE__*/
        function () {
          var _onCare = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee() {
            return _regeneratorRuntime().wrap(function _callee$(_context) {
              while (1) switch (_context.prev = _context.next) {
                case 0:
                  console.log("onCare");
                  this.onItemSelected(CommandType.Care);
                case 2:
                case "end":
                  return _context.stop();
              }
            }, _callee, this);
          }));
          function onCare() {
            return _onCare.apply(this, arguments);
          }
          return onCare;
        }();
        _proto2.onTreat = function onTreat() {
          console.log("onTreat");
          this.onItemSelected(CommandType.Treat);
        };
        _proto2.onCleanse = function onCleanse() {
          console.log("onCleanse");
          this.onItemSelected(CommandType.Cleanse);
        }

        //#endregion

        //#region handle drag operation
        ;

        _proto2.initializeDragOperation = function initializeDragOperation(worldPosition) {
          if (this.btnCropCare.node.activeInHierarchy && UIHelper.isPointInUINode(worldPosition, this.btnCropCare.node)) {
            console.log("initializeDragOperation: Crop Care active = " + this.btnCropCare.node.activeInHierarchy);
            this.operationSprite.spriteFrame = this.btnCropCare.node.getComponent(Sprite).spriteFrame;
            this.dragOperation = new DragOperation(OperationTargetType.Crop, CommandType.Care, null, null);
          } else if (this.btnAnimalCare.node.activeInHierarchy && UIHelper.isPointInUINode(worldPosition, this.btnAnimalCare.node)) {
            this.operationSprite.spriteFrame = this.btnAnimalCare.node.getComponent(Sprite).spriteFrame;
            this.dragOperation = new DragOperation(OperationTargetType.Animal, CommandType.Care, null, null);
          } else if (this.btnCropTreat.node.activeInHierarchy && UIHelper.isPointInUINode(worldPosition, this.btnCropTreat.node)) {
            this.operationSprite.spriteFrame = this.btnCropTreat.node.getComponent(Sprite).spriteFrame;
            this.dragOperation = new DragOperation(OperationTargetType.Crop, CommandType.Treat, null, null);
          } else if (this.btnAnimalTreat.node.activeInHierarchy && UIHelper.isPointInUINode(worldPosition, this.btnAnimalTreat.node)) {
            this.operationSprite.spriteFrame = this.btnAnimalTreat.node.getComponent(Sprite).spriteFrame;
            this.dragOperation = new DragOperation(OperationTargetType.Animal, CommandType.Treat, null, null);
          } else if (this.btnCropCleanse.node.activeInHierarchy && UIHelper.isPointInUINode(worldPosition, this.btnCropCleanse.node)) {
            this.operationSprite.spriteFrame = this.btnCropCleanse.node.getComponent(Sprite).spriteFrame;
            this.dragOperation = new DragOperation(OperationTargetType.Crop, CommandType.Cleanse, null, null);
          } else if (this.btnAnimalCleanse.node.activeInHierarchy && UIHelper.isPointInUINode(worldPosition, this.btnAnimalCleanse.node)) {
            this.operationSprite.spriteFrame = this.btnAnimalCleanse.node.getComponent(Sprite).spriteFrame;
            this.dragOperation = new DragOperation(OperationTargetType.Animal, CommandType.Cleanse, null, null);
          }
          if (this.dragOperation) {
            this.canHide = false;
            this.collectingDiamondRefCount = 0;
            this.operationSprite.node.active = true;
            this.dragOperation.dragNode = this.operationSprite.node;
            this.playerController.interactionMode = InteractionMode.Command;
          }
        };
        _proto2.handleCropDragOperation = function handleCropDragOperation() {
          // console.log("FarmSelectionWindow: handleCropDragOperation");
          var plots = this.playerController.visitMode ? this.gameController.FriendPlotTiles : this.gameController.PlayerPlotTiles;
          for (var i = 0; i < plots.length; i++) {
            var plot = plots[i];
            //check if currentDragTarget is in the pilot
            if (this.dragOperation.targetNode !== plot.node && UIHelper.isPointInUINodeWorldPosition(this.dragOperation.dragNode.worldPosition, plot.node)) {
              if (this.dragOperation.operation === CommandType.Care) {
                this.handleCarePlot(plot);
              } else if (this.dragOperation.operation === CommandType.Treat) {
                this.handleTreatPlot(plot);
              } else if (this.dragOperation.operation === CommandType.Cleanse) {
                this.handleCleansePlot(plot);
              }
              this.dragOperation.targetNode = plot.node;
              break;
            }
          }
        };
        _proto2.handleAnimalDragOperation = function handleAnimalDragOperation() {
          //console.log("FarmSelectionWindow: handleAnimalDragOperation");
          var fence = this.gameController.getAvailableFence();
          var animals = fence.getAnimals();
          for (var i = 0; i < animals.length; i++) {
            var animal = animals[i];
            //check if currentDragTarget is in the pilot
            if (this.dragOperation.targetNode !== animal.node && UIHelper.isPointInUINodeWorldPosition(this.dragOperation.dragNode.worldPosition, animal.node)) {
              if (this.dragOperation.operation === CommandType.Care) {
                this.handleCareAnimal(animal);
              } else if (this.dragOperation.operation === CommandType.Treat) {
                this.handleTreatAnimal(animal);
              } else if (this.dragOperation.operation === CommandType.Cleanse) {
                this.handleCleanseAnimal(animal);
              }
              this.dragOperation.targetNode = animal.node;
            }
          }
        }

        //#region handle crop operation
        ;

        _proto2.handleCarePlot = /*#__PURE__*/
        function () {
          var _handleCarePlot = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2(plotTile) {
            var _this5 = this;
            var crop, careResult;
            return _regeneratorRuntime().wrap(function _callee2$(_context2) {
              while (1) switch (_context2.prev = _context2.next) {
                case 0:
                  console.log("handleCare plot = " + plotTile.node.name + " , occupied = " + plotTile.isOccupied);
                  if (plotTile.isOccupied) {
                    _context2.next = 3;
                    break;
                  }
                  return _context2.abrupt("return");
                case 3:
                  crop = plotTile.OcuippedCrop;
                  if (!crop) {
                    _context2.next = 20;
                    break;
                  }
                  if (!crop.canCare()) {
                    _context2.next = 19;
                    break;
                  }
                  careResult = null;
                  if (!this.playerController.visitMode) {
                    _context2.next = 13;
                    break;
                  }
                  _context2.next = 10;
                  return crop.careByFriend(this.playerController.friendState.id);
                case 10:
                  careResult = _context2.sent;
                  _context2.next = 16;
                  break;
                case 13:
                  _context2.next = 15;
                  return crop.care();
                case 15:
                  careResult = _context2.sent;
                case 16:
                  if (careResult && careResult.success) {
                    console.log("care result: " + careResult.success);
                    if (careResult.data.friend_id) {
                      console.log("care friend , name = " + careResult.data.friend_id + " , friend_id = " + this.playerController.friendState.id + " , diamond_added = " + careResult.data.diamond_added);
                      this.collectingDiamondRefCount++;
                      this.playDiamondCollectionEffect(plotTile.node, careResult.data.diamond_added, function () {
                        _this5.collectingDiamondRefCount--;
                        _this5.hide();
                      });
                    }
                  }
                  _context2.next = 20;
                  break;
                case 19:
                  console.log("Crop cannot care");
                case 20:
                  this.hide();
                case 21:
                case "end":
                  return _context2.stop();
              }
            }, _callee2, this);
          }));
          function handleCarePlot(_x) {
            return _handleCarePlot.apply(this, arguments);
          }
          return handleCarePlot;
        }();
        _proto2.handleTreatPlot = /*#__PURE__*/function () {
          var _handleTreatPlot = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee3(plotTile) {
            var _this6 = this;
            var crop, treatResult;
            return _regeneratorRuntime().wrap(function _callee3$(_context3) {
              while (1) switch (_context3.prev = _context3.next) {
                case 0:
                  console.log("handleTreat");
                  if (plotTile.isOccupied) {
                    _context3.next = 3;
                    break;
                  }
                  return _context3.abrupt("return");
                case 3:
                  crop = plotTile.OcuippedCrop;
                  if (!crop) {
                    _context3.next = 20;
                    break;
                  }
                  if (!crop.canTreat()) {
                    _context3.next = 19;
                    break;
                  }
                  treatResult = null;
                  if (!this.playerController.visitMode) {
                    _context3.next = 13;
                    break;
                  }
                  _context3.next = 10;
                  return crop.treatByFriend(this.playerController.friendState.id);
                case 10:
                  treatResult = _context3.sent;
                  _context3.next = 16;
                  break;
                case 13:
                  _context3.next = 15;
                  return crop.treat();
                case 15:
                  treatResult = _context3.sent;
                case 16:
                  if (treatResult && treatResult.success) {
                    console.log("treat result: " + treatResult.success);
                    this.collectingDiamondRefCount++;
                    this.playDiamondCollectionEffect(plotTile.node, treatResult.data.diamond_added, function () {
                      _this6.collectingDiamondRefCount--;
                      _this6.hide();
                    });
                  }
                  _context3.next = 20;
                  break;
                case 19:
                  console.log("Crop cannot treat");
                case 20:
                  this.hide();
                case 21:
                case "end":
                  return _context3.stop();
              }
            }, _callee3, this);
          }));
          function handleTreatPlot(_x2) {
            return _handleTreatPlot.apply(this, arguments);
          }
          return handleTreatPlot;
        }();
        _proto2.handleCleansePlot = /*#__PURE__*/function () {
          var _handleCleansePlot = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee4(plotTile) {
            var _this7 = this;
            var crop, cleanseResult;
            return _regeneratorRuntime().wrap(function _callee4$(_context4) {
              while (1) switch (_context4.prev = _context4.next) {
                case 0:
                  console.log("handleCleanse");
                  if (plotTile.isOccupied) {
                    _context4.next = 3;
                    break;
                  }
                  return _context4.abrupt("return");
                case 3:
                  crop = plotTile.OcuippedCrop;
                  if (!crop) {
                    _context4.next = 20;
                    break;
                  }
                  if (!crop.canCleanse()) {
                    _context4.next = 19;
                    break;
                  }
                  cleanseResult = null;
                  if (!this.playerController.visitMode) {
                    _context4.next = 13;
                    break;
                  }
                  _context4.next = 10;
                  return crop.cleanseByFriend(this.playerController.friendState.id);
                case 10:
                  cleanseResult = _context4.sent;
                  _context4.next = 16;
                  break;
                case 13:
                  _context4.next = 15;
                  return crop.cleanse();
                case 15:
                  cleanseResult = _context4.sent;
                case 16:
                  if (cleanseResult && cleanseResult.success) {
                    console.log("cleanse result: " + cleanseResult.success);
                    this.collectingDiamondRefCount++;
                    this.playDiamondCollectionEffect(plotTile.node, cleanseResult.data.diamond_added, function () {
                      _this7.collectingDiamondRefCount--;
                      _this7.hide();
                    });
                  }
                  _context4.next = 20;
                  break;
                case 19:
                  console.log("Crop cannot cleanse");
                case 20:
                  this.hide();
                case 21:
                case "end":
                  return _context4.stop();
              }
            }, _callee4, this);
          }));
          function handleCleansePlot(_x3) {
            return _handleCleansePlot.apply(this, arguments);
          }
          return handleCleansePlot;
        }() //#endregion
        //#region handle animal operation
        ;

        _proto2.handleCareAnimal = /*#__PURE__*/
        function () {
          var _handleCareAnimal = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee5(animal) {
            var _this8 = this;
            var careResult;
            return _regeneratorRuntime().wrap(function _callee5$(_context5) {
              while (1) switch (_context5.prev = _context5.next) {
                case 0:
                  if (!animal.canCare()) {
                    _context5.next = 12;
                    break;
                  }
                  careResult = null;
                  if (!this.playerController.visitMode) {
                    _context5.next = 8;
                    break;
                  }
                  _context5.next = 5;
                  return animal.careByFriend(this.playerController.friendState.id);
                case 5:
                  careResult = _context5.sent;
                  _context5.next = 11;
                  break;
                case 8:
                  _context5.next = 10;
                  return animal.care();
                case 10:
                  careResult = _context5.sent;
                case 11:
                  if (careResult && careResult.success) {
                    console.log("care result: " + careResult.success);
                    this.collectingDiamondRefCount++;
                    this.playDiamondCollectionEffect(animal.node, careResult.data.diamond_added, function () {
                      _this8.collectingDiamondRefCount--;
                      _this8.hide();
                    });
                  }
                case 12:
                  this.hide();
                case 13:
                case "end":
                  return _context5.stop();
              }
            }, _callee5, this);
          }));
          function handleCareAnimal(_x4) {
            return _handleCareAnimal.apply(this, arguments);
          }
          return handleCareAnimal;
        }();
        _proto2.handleTreatAnimal = /*#__PURE__*/function () {
          var _handleTreatAnimal = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee6(animal) {
            var _this9 = this;
            var treatResult;
            return _regeneratorRuntime().wrap(function _callee6$(_context6) {
              while (1) switch (_context6.prev = _context6.next) {
                case 0:
                  console.log("handleTreatAnimal");
                  if (!animal.canTreat()) {
                    _context6.next = 13;
                    break;
                  }
                  treatResult = null;
                  if (!this.playerController.visitMode) {
                    _context6.next = 9;
                    break;
                  }
                  _context6.next = 6;
                  return animal.treatByFriend(this.playerController.friendState.id);
                case 6:
                  treatResult = _context6.sent;
                  _context6.next = 12;
                  break;
                case 9:
                  _context6.next = 11;
                  return animal.treat();
                case 11:
                  treatResult = _context6.sent;
                case 12:
                  if (treatResult && treatResult.success) {
                    console.log("treat result: " + treatResult.success);
                    this.collectingDiamondRefCount++;
                    this.playDiamondCollectionEffect(animal.node, treatResult.data.diamond_added, function () {
                      _this9.collectingDiamondRefCount--;
                      _this9.hide();
                    });
                  }
                case 13:
                  this.hide();
                case 14:
                case "end":
                  return _context6.stop();
              }
            }, _callee6, this);
          }));
          function handleTreatAnimal(_x5) {
            return _handleTreatAnimal.apply(this, arguments);
          }
          return handleTreatAnimal;
        }();
        _proto2.handleCleanseAnimal = /*#__PURE__*/function () {
          var _handleCleanseAnimal = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee7(animal) {
            var _this10 = this;
            var cleanseResult;
            return _regeneratorRuntime().wrap(function _callee7$(_context7) {
              while (1) switch (_context7.prev = _context7.next) {
                case 0:
                  console.log("handleCleanseAnimal");
                  if (!animal.canCleanse()) {
                    _context7.next = 13;
                    break;
                  }
                  cleanseResult = null;
                  if (!this.playerController.visitMode) {
                    _context7.next = 9;
                    break;
                  }
                  _context7.next = 6;
                  return animal.cleanseByFriend(this.playerController.friendState.id);
                case 6:
                  cleanseResult = _context7.sent;
                  _context7.next = 12;
                  break;
                case 9:
                  _context7.next = 11;
                  return animal.cleanse();
                case 11:
                  cleanseResult = _context7.sent;
                case 12:
                  if (cleanseResult && cleanseResult.success) {
                    console.log("cleanse result: " + cleanseResult.success);
                    this.collectingDiamondRefCount++;
                    this.playDiamondCollectionEffect(animal.node, cleanseResult.data.diamond_added, function () {
                      _this10.collectingDiamondRefCount--;
                      _this10.hide();
                    });
                  }
                case 13:
                  this.hide();
                case 14:
                case "end":
                  return _context7.stop();
              }
            }, _callee7, this);
          }));
          function handleCleanseAnimal(_x6) {
            return _handleCleanseAnimal.apply(this, arguments);
          }
          return handleCleanseAnimal;
        }() //#endregion
        //#endregion
        ;

        _proto2.onItemSelected = function onItemSelected(data) {
          if (data === void 0) {
            data = null;
          }
          // if(this.operationSprite){
          //     this.operationSprite.spriteFrame = this.btnCropCare.node.getComponent(Sprite).spriteFrame;
          //     this.operationSprite.node.active = true;
          //     const currentPosition = this.operationSprite.node.worldPosition;
          //    // this.gameController.
          // }

          this.callback(data);
          WindowManager.instance.hide(SharedDefines.WINDOW_SELECTION_NAME);
        };
        _proto2.playDiamondCollectionEffect = /*#__PURE__*/function () {
          var _playDiamondCollectionEffect = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee8(startNode, diamondAmount, callback) {
            var _this11 = this;
            var gameWindow, diamondDisplay, endPos, coinEffect;
            return _regeneratorRuntime().wrap(function _callee8$(_context8) {
              while (1) switch (_context8.prev = _context8.next) {
                case 0:
                  gameWindow = WindowManager.instance.getWindow(SharedDefines.WINDOW_GAME_NAME);
                  diamondDisplay = gameWindow.diamondDisplay;
                  if (diamondDisplay) {
                    _context8.next = 5;
                    break;
                  }
                  console.error('diamondDisplay not found');
                  return _context8.abrupt("return");
                case 5:
                  endPos = diamondDisplay.currencySpriteNode.getWorldPosition();
                  _context8.next = 8;
                  return UIEffectHelper.playCoinCollectionEffect(CoinType.DIAMOND, this.node, startNode.getWorldPosition(), endPos);
                case 8:
                  coinEffect = _context8.sent;
                  coinEffect.node.on("effectComplete", function () {
                    _this11.playerController.playerState.addDiamond(diamondAmount);
                    _this11.playerController.friendState.addDiamond(diamondAmount);
                    callback();
                  }, coinEffect.node);
                case 10:
                case "end":
                  return _context8.stop();
              }
            }, _callee8, this);
          }));
          function playDiamondCollectionEffect(_x7, _x8, _x9) {
            return _playDiamondCollectionEffect.apply(this, arguments);
          }
          return playDiamondCollectionEffect;
        }();
        return FarmSelectionWindow;
      }(WindowBase), (_descriptor = _applyDecoratedDescriptor(_class3.prototype, "selectionNode", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class3.prototype, "scrollView", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class3.prototype, "plotCommandNode", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor4 = _applyDecoratedDescriptor(_class3.prototype, "animalCommandNode", [_dec5], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor5 = _applyDecoratedDescriptor(_class3.prototype, "btnCropCare", [_dec6], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor6 = _applyDecoratedDescriptor(_class3.prototype, "btnCropTreat", [_dec7], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor7 = _applyDecoratedDescriptor(_class3.prototype, "btnCropCleanse", [_dec8], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor8 = _applyDecoratedDescriptor(_class3.prototype, "btnAnimalCare", [_dec9], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor9 = _applyDecoratedDescriptor(_class3.prototype, "btnAnimalTreat", [_dec10], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor10 = _applyDecoratedDescriptor(_class3.prototype, "btnAnimalCleanse", [_dec11], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor11 = _applyDecoratedDescriptor(_class3.prototype, "itemPrefab", [_dec12], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor12 = _applyDecoratedDescriptor(_class3.prototype, "operationSprite", [_dec13], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      })), _class3)) || _class2));
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/Fence.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './Animal.ts', './ResourceManager.ts', './SharedDefines.ts', './WindowManager.ts', './CooldownComponent.ts', './NetworkManager.ts', './SceneEntity.ts', './UIEffectHelper.ts', './CoinCollectionEffectComponent.ts', './GameController.ts'], function (exports) {
  var _applyDecoratedDescriptor, _inheritsLoose, _initializerDefineProperty, _assertThisInitialized, _createForOfIteratorHelperLoose, _asyncToGenerator, _regeneratorRuntime, cclegacy, _decorator, EventTarget, Director, UITransform, Vec3, Vec2, Rect, instantiate, Animal, ResourceManager, SharedDefines, FarmSelectionType, SceneItemType, CommandType, WindowManager, CooldownComponent, NetworkManager, SceneEntity, UIEffectHelper, CoinType, GameController;
  return {
    setters: [function (module) {
      _applyDecoratedDescriptor = module.applyDecoratedDescriptor;
      _inheritsLoose = module.inheritsLoose;
      _initializerDefineProperty = module.initializerDefineProperty;
      _assertThisInitialized = module.assertThisInitialized;
      _createForOfIteratorHelperLoose = module.createForOfIteratorHelperLoose;
      _asyncToGenerator = module.asyncToGenerator;
      _regeneratorRuntime = module.regeneratorRuntime;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      EventTarget = module.EventTarget;
      Director = module.Director;
      UITransform = module.UITransform;
      Vec3 = module.Vec3;
      Vec2 = module.Vec2;
      Rect = module.Rect;
      instantiate = module.instantiate;
    }, function (module) {
      Animal = module.Animal;
    }, function (module) {
      ResourceManager = module.ResourceManager;
    }, function (module) {
      SharedDefines = module.SharedDefines;
      FarmSelectionType = module.FarmSelectionType;
      SceneItemType = module.SceneItemType;
      CommandType = module.CommandType;
    }, function (module) {
      WindowManager = module.WindowManager;
    }, function (module) {
      CooldownComponent = module.CooldownComponent;
    }, function (module) {
      NetworkManager = module.NetworkManager;
    }, function (module) {
      SceneEntity = module.SceneEntity;
    }, function (module) {
      UIEffectHelper = module.UIEffectHelper;
    }, function (module) {
      CoinType = module.CoinType;
    }, function (module) {
      GameController = module.GameController;
    }],
    execute: function () {
      var _dec, _class, _class2, _descriptor;
      cclegacy._RF.push({}, "92a59YTgbVKEZqE5e/5WAji", "Fence", undefined);
      var ccclass = _decorator.ccclass,
        property = _decorator.property;
      var Fence = exports('Fence', (_dec = ccclass('Fence'), _dec(_class = (_class2 = /*#__PURE__*/function (_SceneEntity) {
        _inheritsLoose(Fence, _SceneEntity);
        function Fence() {
          var _this;
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          _this = _SceneEntity.call.apply(_SceneEntity, [this].concat(args)) || this;
          _this.gameController = null;
          _initializerDefineProperty(_this, "capacity", _descriptor, _assertThisInitialized(_this));
          _this.occupiedSpace = 0;
          _this.animals = [];
          _this.dragDropComponent = null;
          _this.cooldownComponent = null;
          _this.playerController = null;
          _this.eventTarget = new EventTarget();
          return _this;
        }
        var _proto = Fence.prototype;
        _proto.onLoad = function onLoad() {
          this.cooldownComponent = this.addComponent(CooldownComponent);
        };
        _proto.start = function start() {
          this.gameController = Director.instance.getScene().getComponentInChildren(GameController);
          this.playerController = this.gameController.getPlayerController();
          if (!this.playerController) {
            console.error('Fence: PlayerController not found!');
          }
        };
        _proto.initialize = function initialize(isPlayerOwner) {
          this.init('fence', isPlayerOwner);
        };
        _proto.getAvailableSpace = function getAvailableSpace() {
          return this.capacity - this.occupiedSpace;
        };
        _proto.canAcceptAnimal = function canAcceptAnimal(animal) {
          return true; //this.getAvailableSpace() >= requiredSpace;
        }

        // Add this method to the Fence class
        ;

        _proto.getAnimalAtPosition = function getAnimalAtPosition(touchPos) {
          for (var _iterator = _createForOfIteratorHelperLoose(this.animals), _step; !(_step = _iterator()).done;) {
            var animal = _step.value;
            var animalNode = animal.node;
            var animalUITransform = animalNode.getComponent(UITransform);
            if (animalUITransform) {
              var worldPos = this.node.getComponent(UITransform).convertToWorldSpaceAR(animalNode.position);
              var localPos = this.node.getComponent(UITransform).convertToNodeSpaceAR(new Vec3(touchPos.x, touchPos.y, 0));
              if (animalUITransform.getBoundingBox().contains(new Vec2(localPos.x, localPos.y))) {
                return animal;
              }
            }
          }
          return null;
        };
        _proto.tryAddAnimal = /*#__PURE__*/function () {
          var _tryAddAnimal = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(animalId, worldPos) {
            var animalPrefab, animalNode, animal;
            return _regeneratorRuntime().wrap(function _callee$(_context) {
              while (1) switch (_context.prev = _context.next) {
                case 0:
                  if (worldPos === void 0) {
                    worldPos = Vec3.ZERO;
                  }
                  _context.next = 3;
                  return ResourceManager.instance.loadPrefab(SharedDefines.PREFAB_ANIMAL);
                case 3:
                  animalPrefab = _context.sent;
                  animalNode = instantiate(animalPrefab);
                  animalNode.name = animalId;
                  animal = animalNode.getComponent(Animal);
                  animal.initialize(animalId);
                  this.node.addChild(animal.node);
                  animalNode.setWorldPosition(worldPos);
                  return _context.abrupt("return", this.addAnimal(animal));
                case 11:
                case "end":
                  return _context.stop();
              }
            }, _callee, this);
          }));
          function tryAddAnimal(_x, _x2) {
            return _tryAddAnimal.apply(this, arguments);
          }
          return tryAddAnimal;
        }();
        _proto.addAnimal = function addAnimal(animal) {
          console.log('addAnimal', animal);
          if (this.canAcceptAnimal(animal)) {
            console.log('addAnimal canAcceptAnimal', animal);
            this.node.addChild(animal.node);
            animal.eventTarget.once(SharedDefines.EVENT_ANIMAL_HARVEST, this.onAnimalHarvest, this);
            animal.startGrowing();
            this.animals.push(animal);
            this.occupiedSpace += 1; //parseInt(animal.gridCapacity);
            return true;
          }
          return false;
        };
        _proto.findAnimalBySceneId = function findAnimalBySceneId(sceneId) {
          for (var _iterator2 = _createForOfIteratorHelperLoose(this.animals), _step2; !(_step2 = _iterator2()).done;) {
            var animal = _step2.value;
            if (animal.SceneItem && animal.SceneItem.id == sceneId) {
              return animal;
            }
          }
          return null;
        };
        _proto.removeAnimal = function removeAnimal(animal) {
          var index = this.animals.indexOf(animal);
          if (index !== -1) {
            this.animals.splice(index, 1);
            this.occupiedSpace -= 1;
          }
        };
        _proto.getAnimals = function getAnimals() {
          return this.animals;
        };
        _proto.isPointInside = function isPointInside(point) {
          var uiTransform = this.getComponent(UITransform);
          if (!uiTransform) return false;
          var worldPos = this.node.getWorldPosition();
          var size = uiTransform.contentSize;
          var rect = new Rect(worldPos.x - size.width / 2, worldPos.y - size.height / 2, size.width, size.height);
          return rect.contains(point);
        };
        _proto.select = function select(dragComponent, touchPos, fromFriend) {
          if (this.cooldownComponent.isOnCooldown('select')) {
            return; // if cooldown is on, ignore this select
          }
          // Check if any animal is selected
          for (var _iterator3 = _createForOfIteratorHelperLoose(this.animals), _step3; !(_step3 = _iterator3()).done;) {
            var animal = _step3.value;
            var animalNode = animal.node;
            var animalUITransform = animalNode.getComponent(UITransform);
            if (animalUITransform) {
              var worldPos = this.node.getComponent(UITransform).convertToWorldSpaceAR(animalNode.position);
              var localPos = this.node.getComponent(UITransform).convertToNodeSpaceAR(new Vec3(touchPos.x, touchPos.y, 0));
              //  const localPos = WindowManager.instance.uiCamera.convertToUINode(worldPos,this.node);
              console.log("Animal " + animal.id + " worldPos: " + worldPos + ", localPos: " + localPos + ",touchPos = " + touchPos);
              if (animalUITransform.getBoundingBox().contains(new Vec2(localPos.x, localPos.y))) {
                console.log("Animal " + animal.id + " is selected");
                if (animal.canHarvest()) {
                  animal.harvest();
                  return;
                }

                // Animal is selected
                WindowManager.instance.show(SharedDefines.WINDOW_SELECTION_NAME, FarmSelectionType.ANIMAL_COMMAND, animalNode, touchPos, this.onAnimalCommandSelected.bind(this, animal));
                return;
              }
            }
          }

          // If no animal is selected, proceed with the original fence selection logic
          this.dragDropComponent = dragComponent;
          WindowManager.instance.show(SharedDefines.WINDOW_SELECTION_NAME, FarmSelectionType.FENCE, this.node, touchPos, this.onSelectionWindowItemClicked.bind(this));
        };
        _proto.onAnimalCommandSelected = /*#__PURE__*/function () {
          var _onAnimalCommandSelected = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2(animal, command) {
            var sceneItem, careResult, treatResult, cleanseResult;
            return _regeneratorRuntime().wrap(function _callee2$(_context2) {
              while (1) switch (_context2.prev = _context2.next) {
                case 0:
                  // Handle the animal command selection
                  console.log("Animal command selected: " + command + " for animal " + animal.node.name);
                  // Implement the logic for handling animal commands here
                  this.cooldownComponent.startCooldown('select', SharedDefines.COOLDOWN_SELECTION_TIME, function () {});
                  sceneItem = animal.SceneItem;
                  if (!sceneItem) {
                    _context2.next = 44;
                    break;
                  }
                  if (!(command == CommandType.Care)) {
                    _context2.next = 18;
                    break;
                  }
                  careResult = null;
                  if (!this.playerController.visitMode) {
                    _context2.next = 12;
                    break;
                  }
                  _context2.next = 9;
                  return NetworkManager.instance.careFriend(sceneItem.id, this.playerController.friendState.id);
                case 9:
                  careResult = _context2.sent;
                  _context2.next = 15;
                  break;
                case 12:
                  _context2.next = 14;
                  return NetworkManager.instance.care(sceneItem.id);
                case 14:
                  careResult = _context2.sent;
                case 15:
                  if (careResult.success) {
                    animal.CareCount = careResult.data.care_count;
                    if (careResult.data.friend_id) {
                      console.log("care friend , name = " + careResult.data.friend_id + " , friend_id = " + this.playerController.friendState.id + " , diamond_added = " + careResult.data.diamond_added);
                      this.playDiamondCollectionEffect(careResult.data.diamond_added);
                    }
                  } else {
                    console.log("Care failed");
                  }
                  _context2.next = 44;
                  break;
                case 18:
                  if (!(command == CommandType.Treat)) {
                    _context2.next = 32;
                    break;
                  }
                  treatResult = null;
                  if (!this.playerController.visitMode) {
                    _context2.next = 26;
                    break;
                  }
                  _context2.next = 23;
                  return NetworkManager.instance.treatFriend(sceneItem.id, this.playerController.friendState.id);
                case 23:
                  treatResult = _context2.sent;
                  _context2.next = 29;
                  break;
                case 26:
                  _context2.next = 28;
                  return NetworkManager.instance.treat(sceneItem.id);
                case 28:
                  treatResult = _context2.sent;
                case 29:
                  if (treatResult.success) {
                    animal.TreatCount = treatResult.data.treat_count;
                    if (treatResult.data.friend_id) {
                      console.log("treat friend , name = " + treatResult.data.friend_id + " , friend_id = " + this.playerController.friendState.id + " , diamond_added = " + treatResult.data.diamond_added);
                      this.playDiamondCollectionEffect(treatResult.data.diamond_added);
                    }
                  } else {
                    console.log("Treat failed");
                  }
                  _context2.next = 44;
                  break;
                case 32:
                  if (!(command == CommandType.Cleanse)) {
                    _context2.next = 44;
                    break;
                  }
                  cleanseResult = null;
                  if (!this.playerController.visitMode) {
                    _context2.next = 40;
                    break;
                  }
                  _context2.next = 37;
                  return NetworkManager.instance.cleanseFriend(sceneItem.id, this.playerController.friendState.id);
                case 37:
                  cleanseResult = _context2.sent;
                  _context2.next = 43;
                  break;
                case 40:
                  _context2.next = 42;
                  return NetworkManager.instance.cleanse(sceneItem.id);
                case 42:
                  cleanseResult = _context2.sent;
                case 43:
                  if (cleanseResult.success) {
                    animal.setImmunityDuration(cleanseResult.data.cleanse_count, new Date());
                    if (cleanseResult.data.friend_id) {
                      console.log("cleanse friend , name = " + cleanseResult.data.friend_id + " , friend_id = " + this.playerController.friendState.id + " , diamond_added = " + cleanseResult.data.diamond_added);
                      this.playDiamondCollectionEffect(cleanseResult.data.diamond_added);
                    }
                  } else {
                    console.log("Cleanse failed");
                  }
                case 44:
                case "end":
                  return _context2.stop();
              }
            }, _callee2, this);
          }));
          function onAnimalCommandSelected(_x3, _x4) {
            return _onAnimalCommandSelected.apply(this, arguments);
          }
          return onAnimalCommandSelected;
        }();
        _proto.onSelectionWindowItemClicked = /*#__PURE__*/function () {
          var _onSelectionWindowItemClicked = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee3(inventoryItem) {
            var animalPrefab, animalNode, animal, gameplayNode;
            return _regeneratorRuntime().wrap(function _callee3$(_context3) {
              while (1) switch (_context3.prev = _context3.next) {
                case 0:
                  _context3.next = 2;
                  return ResourceManager.instance.loadPrefab(SharedDefines.PREFAB_ANIMAL);
                case 2:
                  animalPrefab = _context3.sent;
                  animalNode = instantiate(animalPrefab);
                  animalNode.name = inventoryItem.detailId;
                  animal = animalNode.getComponent(Animal);
                  animal.initializeWithInventoryItem(inventoryItem);
                  animal.updateSprite("" + SharedDefines.WINDOW_SHOP_TEXTURES + inventoryItem.iconName);
                  gameplayNode = Director.instance.getScene().getChildByPath(SharedDefines.PATH_GAMEPLAY);
                  gameplayNode.addChild(animal.node);

                  //animalNode.setWorldPosition(worldPos);
                  this.dragDropComponent.startDragging(animal, animalNode);
                case 11:
                case "end":
                  return _context3.stop();
              }
            }, _callee3, this);
          }));
          function onSelectionWindowItemClicked(_x5) {
            return _onSelectionWindowItemClicked.apply(this, arguments);
          }
          return onSelectionWindowItemClicked;
        }() //#region IDraggable implementation
        ;

        _proto.getNode = function getNode() {
          return this.node;
        };
        _proto.canAcceptDrop = function canAcceptDrop(draggable) {
          if (draggable instanceof Animal) {
            return this.canAcceptAnimal(draggable);
          }
          return false;
        };
        _proto.onDrop = function onDrop(draggable) {
          var _this2 = this;
          if (draggable instanceof Animal) {
            var animal = draggable;
            var worldPos = animal.node.getWorldPosition();
            //this.node.addChild(animal.node);

            NetworkManager.instance.eventTarget.once(NetworkManager.EVENT_PLANT, function (result) {
              if (!result.success) {
                console.log('animal plant failed , name = ' + animal.node.name);
                return;
              }
              animal.initializeWithSceneItem(result.data, true);
              if (_this2.addAnimal(animal)) {
                animal.node.setWorldPosition(worldPos);
                _this2.eventTarget.emit(SharedDefines.EVENT_FENCE_ANIMAL_ADDED, animal);
              }
            });

            //convert world pos to design pos
            var designPos = new Vec2(worldPos.x / this.gameController.ScreenScale.x, worldPos.y / this.gameController.ScreenScale.y);
            NetworkManager.instance.plant(animal.id, SceneItemType.Animal, designPos.x, designPos.y, this.node.name);
            this.cooldownComponent.startCooldown('select', SharedDefines.COOLDOWN_SELECTION_TIME, function () {});
          }
        }
        //#endregion
        ;

        _proto.onAnimalHarvest = function onAnimalHarvest(animal) {
          console.log('onAnimalHarvest', animal);
          this.removeAnimal(animal);
        };
        _proto.playDiamondCollectionEffect = /*#__PURE__*/function () {
          var _playDiamondCollectionEffect = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee4(diamondAmount) {
            var _this3 = this;
            var gameWindow, diamondDisplay, endPos, coinEffect;
            return _regeneratorRuntime().wrap(function _callee4$(_context4) {
              while (1) switch (_context4.prev = _context4.next) {
                case 0:
                  gameWindow = WindowManager.instance.getWindow(SharedDefines.WINDOW_GAME_NAME);
                  diamondDisplay = gameWindow.diamondDisplay;
                  if (diamondDisplay) {
                    _context4.next = 5;
                    break;
                  }
                  console.error('diamondDisplay not found');
                  return _context4.abrupt("return");
                case 5:
                  endPos = diamondDisplay.currencySpriteNode.getWorldPosition();
                  _context4.next = 8;
                  return UIEffectHelper.playCoinCollectionEffect(CoinType.DIAMOND, this.node, this.node.getWorldPosition(), endPos);
                case 8:
                  coinEffect = _context4.sent;
                  coinEffect.node.on("effectComplete", function () {
                    _this3.playerController.playerState.addDiamond(diamondAmount);
                    _this3.playerController.friendState.addDiamond(diamondAmount);
                  }, coinEffect.node);
                case 10:
                case "end":
                  return _context4.stop();
              }
            }, _callee4, this);
          }));
          function playDiamondCollectionEffect(_x6) {
            return _playDiamondCollectionEffect.apply(this, arguments);
          }
          return playDiamondCollectionEffect;
        }();
        return Fence;
      }(SceneEntity), _descriptor = _applyDecoratedDescriptor(_class2.prototype, "capacity", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 0;
        }
      }), _class2)) || _class));
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/GameController.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './PlotTile.ts', './PlayerController.ts', './SharedDefines.ts', './CropDataManager.ts', './ItemDataManager.ts', './BuildDataManager.ts', './AnimalDataManager.ts', './Fence.ts', './Animal.ts', './NetworkManager.ts', './ResourceManager.ts', './Crop.ts', './Building.ts', './InventoryComponent.ts', './PlayerState.ts', './SyntheDataManager.ts', './GradeDataManager.ts'], function (exports) {
  var _applyDecoratedDescriptor, _inheritsLoose, _initializerDefineProperty, _assertThisInitialized, _createClass, _asyncToGenerator, _regeneratorRuntime, _createForOfIteratorHelperLoose, cclegacy, _decorator, Canvas, Prefab, Node, Vec2, EventTarget, instantiate, Component, UITransform, view, Vec3, Layers, PlotTile, PlayerController, SharedDefines, SceneItemType, CropDataManager, ItemDataManager, BuildDataManager, AnimalDataManager, Fence, Animal, NetworkManager, ResourceManager, Crop, Building, InventoryItem, PlayerState, SyntheDataManager, GradeDataManager;
  return {
    setters: [function (module) {
      _applyDecoratedDescriptor = module.applyDecoratedDescriptor;
      _inheritsLoose = module.inheritsLoose;
      _initializerDefineProperty = module.initializerDefineProperty;
      _assertThisInitialized = module.assertThisInitialized;
      _createClass = module.createClass;
      _asyncToGenerator = module.asyncToGenerator;
      _regeneratorRuntime = module.regeneratorRuntime;
      _createForOfIteratorHelperLoose = module.createForOfIteratorHelperLoose;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      Canvas = module.Canvas;
      Prefab = module.Prefab;
      Node = module.Node;
      Vec2 = module.Vec2;
      EventTarget = module.EventTarget;
      instantiate = module.instantiate;
      Component = module.Component;
      UITransform = module.UITransform;
      view = module.view;
      Vec3 = module.Vec3;
      Layers = module.Layers;
    }, function (module) {
      PlotTile = module.PlotTile;
    }, function (module) {
      PlayerController = module.PlayerController;
    }, function (module) {
      SharedDefines = module.SharedDefines;
      SceneItemType = module.SceneItemType;
    }, function (module) {
      CropDataManager = module.CropDataManager;
    }, function (module) {
      ItemDataManager = module.ItemDataManager;
    }, function (module) {
      BuildDataManager = module.BuildDataManager;
    }, function (module) {
      AnimalDataManager = module.AnimalDataManager;
    }, function (module) {
      Fence = module.Fence;
    }, function (module) {
      Animal = module.Animal;
    }, function (module) {
      NetworkManager = module.NetworkManager;
    }, function (module) {
      ResourceManager = module.ResourceManager;
    }, function (module) {
      Crop = module.Crop;
    }, function (module) {
      Building = module.Building;
    }, function (module) {
      InventoryItem = module.InventoryItem;
    }, function (module) {
      PlayerState = module.PlayerState;
    }, function (module) {
      SyntheDataManager = module.SyntheDataManager;
    }, function (module) {
      GradeDataManager = module.GradeDataManager;
    }],
    execute: function () {
      var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5;
      cclegacy._RF.push({}, "b80a938WxlPbKQiuamqojv9", "GameController", undefined);
      var ccclass = _decorator.ccclass,
        property = _decorator.property;
      var GameController = exports('GameController', (_dec = ccclass('GameController'), _dec2 = property(Canvas), _dec3 = property(Prefab), _dec4 = property(Node), _dec5 = property(Node), _dec6 = property(Node), _dec(_class = (_class2 = /*#__PURE__*/function (_Component) {
        _inheritsLoose(GameController, _Component);
        function GameController() {
          var _this;
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          _this = _Component.call.apply(_Component, [this].concat(args)) || this;
          _initializerDefineProperty(_this, "gameplayCanvas", _descriptor, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "playerControllerPrefab", _descriptor2, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "gameplayContainer", _descriptor3, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "friendGameplayContainer", _descriptor4, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "buildingContainer", _descriptor5, _assertThisInitialized(_this));
          _this.playerFence = null;
          _this.friendFence = null;
          _this.playerPlotTiles = [];
          _this.friendPlotTiles = [];
          _this.playerController = null;
          _this.screenScale = new Vec2(1, 1);
          _this.eventTarget = new EventTarget();
          return _this;
        }
        var _proto = GameController.prototype;
        _proto.onLoad = function onLoad() {
          this.setGameViewVisibility(false);
          this.setFriendGameViewVisibility(false);
        };
        _proto.start = /*#__PURE__*/function () {
          var _start = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee() {
            var screenSize, designSize;
            return _regeneratorRuntime().wrap(function _callee$(_context) {
              while (1) switch (_context.prev = _context.next) {
                case 0:
                  console.log("start start ...");
                  _context.next = 3;
                  return this.preloadJsonDatas();
                case 3:
                  this.initializePlayerController();
                  this.setupEventListeners();
                  // this.login();

                  //calculate screen scale
                  screenSize = this.gameplayCanvas.node.getComponent(UITransform).contentSize;
                  console.log("screenSize:" + screenSize);
                  designSize = view.getDesignResolutionSize();
                  this.screenScale.x = screenSize.width / designSize.width;
                  this.screenScale.y = screenSize.height / designSize.height;
                  console.log("screenScale:" + this.screenScale);
                case 11:
                case "end":
                  return _context.stop();
              }
            }, _callee, this);
          }));
          function start() {
            return _start.apply(this, arguments);
          }
          return start;
        }();
        _proto.update = function update(deltaTime) {};
        _proto.onDestroy = function onDestroy() {
          this.eventTarget.removeAll(this);
          NetworkManager.instance.eventTarget.removeAll(this);
        };
        _proto.preloadJsonDatas = /*#__PURE__*/function () {
          var _preloadJsonDatas = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2() {
            return _regeneratorRuntime().wrap(function _callee2$(_context2) {
              while (1) switch (_context2.prev = _context2.next) {
                case 0:
                  _context2.next = 2;
                  return CropDataManager.instance.loadCropData();
                case 2:
                  _context2.next = 4;
                  return ItemDataManager.instance.loadItemData();
                case 4:
                  _context2.next = 6;
                  return BuildDataManager.instance.loadBuildData();
                case 6:
                  _context2.next = 8;
                  return AnimalDataManager.instance.loadAnimalData();
                case 8:
                  _context2.next = 10;
                  return SyntheDataManager.instance.loadSyntheData();
                case 10:
                  _context2.next = 12;
                  return GradeDataManager.instance.initialize();
                case 12:
                case "end":
                  return _context2.stop();
              }
            }, _callee2);
          }));
          function preloadJsonDatas() {
            return _preloadJsonDatas.apply(this, arguments);
          }
          return preloadJsonDatas;
        }() //create getplayerController() method
        ;

        _proto.getPlayerController = function getPlayerController() {
          if (this.playerController) {
            return this.playerController;
          } else {
            console.warn('playerController is not set in GameController');
            return null;
          }
        };
        _proto.AddToGameplayContainer = function AddToGameplayContainer(node) {
          //check if is visit mode
          if (this.playerController.visitMode) {
            this.friendGameplayContainer.addChild(node);
          } else {
            this.gameplayContainer.addChild(node);
          }
        }

        //create setFriendGameViewVisibility(visible: boolean): void method
        ;

        _proto.setFriendGameViewVisibility = function setFriendGameViewVisibility(visible) {
          if (this.friendGameplayContainer) {
            this.friendGameplayContainer.active = visible;
          } else {
            console.warn('friendGameplayContainer is not set in GameController');
          }
        };
        _proto.setGameViewVisibility = function setGameViewVisibility(visible) {
          if (this.gameplayContainer) {
            this.gameplayContainer.active = visible;
          } else {
            console.warn('gameplayContainer is not set in GameController');
          }
        };
        _proto.getAvailableFence = function getAvailableFence() {
          if (this.playerFence && !this.playerController.visitMode) {
            return this.playerFence;
          }
          if (this.friendFence && this.playerController.visitMode) {
            return this.friendFence;
          }
          return null;
        };
        _proto.startGame = function startGame() {
          this.setGameViewVisibility(true);
          this.setFriendGameViewVisibility(false);

          //instantiate playerControllerprefab
        };

        _proto.setupEventListeners = function setupEventListeners() {
          console.log("setupEventListeners start ...");
          //this.playerFence.eventTarget.on(SharedDefines.EVENT_FENCE_ANIMAL_ADDED, this.onFenceAnimalAdded.bind(this));

          var networkManager = NetworkManager.instance;
          networkManager.eventTarget.on(NetworkManager.EVENT_LOGIN_SUCCESS, this.onLoginSuccess.bind(this));
          networkManager.eventTarget.on(NetworkManager.EVENT_GET_USER_SCENE_ITEMS, this.onGetUserSceneItems.bind(this));
          networkManager.eventTarget.on(NetworkManager.EVENT_HARVEST, this.onHarvest.bind(this));

          //#region care and treat (DEPRECATED)
          // networkManager.eventTarget.on(NetworkManager.EVENT_CARE, this.onCared.bind(this));
          // //care firend
          // networkManager.eventTarget.on(NetworkManager.EVENT_CARE_FRIEND, this.onCared.bind(this));
          // networkManager.eventTarget.on(NetworkManager.EVENT_TREAT, this.onTreated.bind(this));
          // networkManager.eventTarget.on(NetworkManager.EVENT_TREAT_FRIEND, this.onTreated.bind(this));
          //#endregion
          console.log("setupEventListeners end ...");
        };
        _proto.initializePlayerController = function initializePlayerController() {
          console.log("initializePlayerController start ...");
          if (this.playerControllerPrefab) {
            var playerControllerNode = instantiate(this.playerControllerPrefab);
            this.node.addChild(playerControllerNode);
            this.playerController = playerControllerNode.getComponent(PlayerController);
          } else {
            console.error('playerControllerPrefab is not set in GameController');
            return;
          }
        };
        _proto.initializePlotTiles = function initializePlotTiles(availablePlotTileNum, plotTiles, isPlayerOwner) {
          var _this2 = this;
          console.log("initializePlotTiles:" + availablePlotTileNum);
          if (plotTiles) {
            for (var i = 0; i < plotTiles.length; i++) {
              var plotTile = plotTiles[i];
              if (!plotTile) continue;
              plotTile.initialize(isPlayerOwner);

              //if i < availablePlotTileNum set plottile visible
              //else set plottile invisible
              plotTile.node.active = i < availablePlotTileNum;
              plotTile.eventTarget.on(SharedDefines.EVENT_PLOT_OCCUPIED, this.onPlotOccupied.bind(this));
              plotTile.eventTarget.on(SharedDefines.EVENT_PLOT_SELECTED, function (plotTile) {
                _this2.eventTarget.emit(SharedDefines.EVENT_PLOT_SELECTED, plotTile);
              }, this);
            }
          } else {
            console.error('plotTiles is not set in GameController');
            return;
          }
        };
        _proto.resetPlotTiles = function resetPlotTiles() {
          if (this.friendPlotTiles) {
            for (var i = 0; i < this.friendPlotTiles.length; i++) {
              var plotTile = this.friendPlotTiles[i];
              if (!plotTile) continue;
              plotTile.clear();
              plotTile.eventTarget.off(SharedDefines.EVENT_PLOT_OCCUPIED, this.onPlotOccupied);
            }
          }
        };
        _proto.onPlotOccupied = function onPlotOccupied(plotTile) {
          var _this$playerControlle;
          var inventoryComponent = (_this$playerControlle = this.playerController) == null ? void 0 : _this$playerControlle.inventoryComponent;
          if (!inventoryComponent) {
            console.error('inventoryComponent is not set in GameController');
            return;
          }
          var crop = plotTile.OcuippedCrop;
          if (!crop) {
            console.error('crop is not set in GameController');
            return;
          }
          //console.log(`onPlotOccupied crop , name = ${crop.node.name} , id = ${crop.SourceInventoryItem.id}`);
          //inventoryComponent.removeItem(crop.SourceInventoryItem.id,1);
          console.log("onPlotOccupied crop 2, name = " + crop.node.name);
        }

        // private onFenceAnimalAdded(animal: Animal): void {
        //     const inventoryComponent = this.playerController?.inventoryComponent;
        //     if (!inventoryComponent) {
        //         console.error('inventoryComponent is not set in GameController');
        //         return;
        //     }

        //     //inventoryComponent.removeItem(animal.SourceInventoryItem.id,1);
        // }

        //implement findPlotTileBySceneId,take plotTiles as parameter and sceneId as parameter
        ;

        _proto.findPlotTileBySceneId = function findPlotTileBySceneId(plotTiles, sceneId) {
          for (var i = 0; i < plotTiles.length; i++) {
            var plotTile = plotTiles[i];
            if (plotTile.OcuippedCrop && plotTile.OcuippedCrop.SceneItem && plotTile.OcuippedCrop.SceneItem.id === sceneId) {
              return plotTile;
            }
          }
          return null;
        }

        //#region network relates
        ;

        _proto.login = /*#__PURE__*/
        function () {
          var _login = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee3(userid, password) {
            var result;
            return _regeneratorRuntime().wrap(function _callee3$(_context3) {
              while (1) switch (_context3.prev = _context3.next) {
                case 0:
                  if (!NetworkManager.instance.SimulateNetwork) {
                    _context3.next = 2;
                    break;
                  }
                  return _context3.abrupt("return");
                case 2:
                  console.log("login start ...");
                  _context3.next = 5;
                  return NetworkManager.instance.login(userid, password);
                case 5:
                  result = _context3.sent;
                  if (!result.success) {
                    _context3.next = 10;
                    break;
                  }
                  _context3.next = 9;
                  return NetworkManager.instance.requestSceneItemsByUserId(userid);
                case 9:
                  return _context3.abrupt("return", result);
                case 10:
                  return _context3.abrupt("return", null);
                case 11:
                case "end":
                  return _context3.stop();
              }
            }, _callee3);
          }));
          function login(_x, _x2) {
            return _login.apply(this, arguments);
          }
          return login;
        }();
        _proto.onLoginSuccess = function onLoginSuccess(userData, token) {
          console.log('login success');
          this.playerController.playerState.initialize(userData, token);
          var networkInventoryItems = userData.inventory_items;
          console.log("onLoginSuccess: networkInventoryItems:", networkInventoryItems);
          this.playerController.inventoryComponent.initialize(networkInventoryItems);
          console.log("onLoginSuccess end ... ");
        };
        _proto.onGetUserSceneItems = /*#__PURE__*/function () {
          var _onGetUserSceneItems = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee4(data) {
            var _this$playerControlle2;
            var sceneItems;
            return _regeneratorRuntime().wrap(function _callee4$(_context4) {
              while (1) switch (_context4.prev = _context4.next) {
                case 0:
                  console.log('get user scene items', data);
                  if (data.success) {
                    _context4.next = 4;
                    break;
                  }
                  console.error('get user scene items failed');
                  return _context4.abrupt("return");
                case 4:
                  sceneItems = data.data;
                  if (data.userid == ((_this$playerControlle2 = this.playerController) == null ? void 0 : _this$playerControlle2.playerState.id)) {
                    this.initializeSceneItems(this.gameplayContainer, sceneItems, this.playerController.playerState.level, true);
                  } else {
                    //visit friends's scene
                    this.initializeSceneItems(this.friendGameplayContainer, sceneItems, 1, false);
                  }
                case 6:
                case "end":
                  return _context4.stop();
              }
            }, _callee4, this);
          }));
          function onGetUserSceneItems(_x3) {
            return _onGetUserSceneItems.apply(this, arguments);
          }
          return onGetUserSceneItems;
        }();
        _proto.initializeSceneItems = /*#__PURE__*/function () {
          var _initializeSceneItems = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee5(gameplayContainer, sceneItems, level, isPlayerOwner) {
            var _this3 = this;
            var buildingContainer, fence, plotTiles, plotNum, _loop, _iterator, _step;
            return _regeneratorRuntime().wrap(function _callee5$(_context6) {
              while (1) switch (_context6.prev = _context6.next) {
                case 0:
                  if (gameplayContainer) {
                    _context6.next = 3;
                    break;
                  }
                  console.error("initializeGameplayContainer");
                  return _context6.abrupt("return");
                case 3:
                  buildingContainer = gameplayContainer.getChildByName("Buildings");
                  fence = isPlayerOwner ? this.playerFence : this.friendFence;
                  if (fence) {
                    _context6.next = 11;
                    break;
                  }
                  fence = gameplayContainer.getComponentInChildren(Fence);
                  if (fence) {
                    _context6.next = 10;
                    break;
                  }
                  console.error("fence is not set in GameController");
                  return _context6.abrupt("return");
                case 10:
                  if (isPlayerOwner) {
                    this.playerFence = fence;
                  } else {
                    this.friendFence = fence;
                  }
                case 11:
                  fence.initialize(isPlayerOwner);
                  plotTiles = isPlayerOwner ? this.playerPlotTiles : this.friendPlotTiles;
                  if (!(!plotTiles || plotTiles.length == 0)) {
                    _context6.next = 19;
                    break;
                  }
                  plotTiles = gameplayContainer.getComponentsInChildren(PlotTile);
                  if (plotTiles) {
                    _context6.next = 18;
                    break;
                  }
                  console.error("plotTiles is not set in GameController");
                  return _context6.abrupt("return");
                case 18:
                  if (isPlayerOwner) {
                    this.playerPlotTiles = plotTiles;
                  } else {
                    this.friendPlotTiles = plotTiles;
                  }
                case 19:
                  //sort plotTiles by name
                  plotTiles.sort(function (a, b) {
                    return a.node.name.localeCompare(b.node.name);
                  });
                  plotNum = SharedDefines.INIT_PLOT_NUM + level - 1;
                  console.log("plotNum:" + plotNum);
                  this.initializePlotTiles(plotNum, plotTiles, isPlayerOwner);
                  _loop = /*#__PURE__*/_regeneratorRuntime().mark(function _loop() {
                    var _plotTiles, _node, _node2, _node3;
                    var item, node, component, plotTile, worldPos;
                    return _regeneratorRuntime().wrap(function _loop$(_context5) {
                      while (1) switch (_context5.prev = _context5.next) {
                        case 0:
                          item = _step.value;
                          node = null;
                          component = null;
                          console.log("item:id" + item.id);
                          _context5.t0 = item.type;
                          _context5.next = _context5.t0 === SceneItemType.Crop ? 7 : _context5.t0 === SceneItemType.Animal ? 15 : _context5.t0 === SceneItemType.Building ? 20 : 25;
                          break;
                        case 7:
                          plotTile = (_plotTiles = plotTiles) == null ? void 0 : _plotTiles.find(function (tile) {
                            return tile.node.name === item.parent_node_name;
                          });
                          if (plotTile) {
                            _context5.next = 10;
                            break;
                          }
                          return _context5.abrupt("return", 1);
                        case 10:
                          _context5.next = 12;
                          return _this3.createCropNode(plotTile, item, isPlayerOwner);
                        case 12:
                          node = _context5.sent;
                          component = (_node = node) == null ? void 0 : _node.getComponent(Crop);
                          return _context5.abrupt("break", 25);
                        case 15:
                          _context5.next = 17;
                          return _this3.createAnimalNode(fence, item, isPlayerOwner);
                        case 17:
                          node = _context5.sent;
                          component = (_node2 = node) == null ? void 0 : _node2.getComponent(Animal);
                          return _context5.abrupt("break", 25);
                        case 20:
                          _context5.next = 22;
                          return _this3.createBuildingNode(buildingContainer, item);
                        case 22:
                          node = _context5.sent;
                          component = (_node3 = node) == null ? void 0 : _node3.getComponent(Building);
                          return _context5.abrupt("break", 25);
                        case 25:
                          if (node && component) {
                            //this.setupSceneItem(node, component, item);
                            //convert world pos to design pos
                            worldPos = new Vec2(item.x * _this3.screenScale.x, item.y * _this3.screenScale.y);
                            node.setWorldPosition(new Vec3(worldPos.x, worldPos.y, 0));
                          }
                        case 26:
                        case "end":
                          return _context5.stop();
                      }
                    }, _loop);
                  });
                  _iterator = _createForOfIteratorHelperLoose(sceneItems);
                case 25:
                  if ((_step = _iterator()).done) {
                    _context6.next = 31;
                    break;
                  }
                  return _context6.delegateYield(_loop(), "t0", 27);
                case 27:
                  if (!_context6.t0) {
                    _context6.next = 29;
                    break;
                  }
                  return _context6.abrupt("continue", 29);
                case 29:
                  _context6.next = 25;
                  break;
                case 31:
                case "end":
                  return _context6.stop();
              }
            }, _callee5, this);
          }));
          function initializeSceneItems(_x4, _x5, _x6, _x7) {
            return _initializeSceneItems.apply(this, arguments);
          }
          return initializeSceneItems;
        }();
        _proto.createCropNode = /*#__PURE__*/function () {
          var _createCropNode = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee6(plotTile, item, isPlayerOwner) {
            var cropData, prefab, node, crop;
            return _regeneratorRuntime().wrap(function _callee6$(_context7) {
              while (1) switch (_context7.prev = _context7.next) {
                case 0:
                  console.log("Creating crop node for item " + item.id);
                  cropData = CropDataManager.instance.findCropDataById(item.item_id);
                  if (cropData) {
                    _context7.next = 5;
                    break;
                  }
                  console.log("Crop data not found for item " + item.id);
                  return _context7.abrupt("return", null);
                case 5:
                  console.log("Loading prefab for item " + item.id);
                  _context7.next = 8;
                  return ResourceManager.instance.loadPrefab(SharedDefines.PREFAB_CROP_CORN);
                case 8:
                  prefab = _context7.sent;
                  if (prefab) {
                    _context7.next = 12;
                    break;
                  }
                  console.log("Prefab not found for item " + item.id);
                  return _context7.abrupt("return", null);
                case 12:
                  node = instantiate(prefab);
                  crop = node.getComponent(Crop);
                  if (crop) {
                    console.log("Initializing crop for item " + item.id);
                    crop.initializeWithSceneItem(item, isPlayerOwner);
                  }

                  //find plot tile in plot tiles with item.parent_node_name
                  // const plotTile = this.plotTiles?.find(tile => tile.node.name === item.parent_node_name);
                  if (plotTile) {
                    console.log("Planting crop for item " + item.id);
                    plotTile.plant(crop);
                  } else {
                    console.error("Plot tile " + item.parent_node_name + " not found");
                  }
                  console.log("Finished creating crop node for item " + item.id);
                  return _context7.abrupt("return", node);
                case 18:
                case "end":
                  return _context7.stop();
              }
            }, _callee6);
          }));
          function createCropNode(_x8, _x9, _x10) {
            return _createCropNode.apply(this, arguments);
          }
          return createCropNode;
        }();
        _proto.createAnimalNode = /*#__PURE__*/function () {
          var _createAnimalNode = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee7(fence, item, isPlayerOwner) {
            var animalData, prefab, node, animal;
            return _regeneratorRuntime().wrap(function _callee7$(_context8) {
              while (1) switch (_context8.prev = _context8.next) {
                case 0:
                  console.log("Creating animal node for item " + item.id);
                  animalData = AnimalDataManager.instance.findAnimalDataById(item.item_id);
                  if (animalData) {
                    _context8.next = 4;
                    break;
                  }
                  return _context8.abrupt("return", null);
                case 4:
                  console.log("Loading prefab for item " + item.id);
                  _context8.next = 7;
                  return ResourceManager.instance.loadPrefab(SharedDefines.PREFAB_ANIMAL);
                case 7:
                  prefab = _context8.sent;
                  if (prefab) {
                    _context8.next = 10;
                    break;
                  }
                  return _context8.abrupt("return", null);
                case 10:
                  console.log("Instantiating prefab for item " + item.id);
                  node = instantiate(prefab);
                  animal = node.getComponent(Animal);
                  if (animal) {
                    console.log("Initializing animal for item " + item.id);
                    animal.initializeWithSceneItem(item, isPlayerOwner);
                    fence.addAnimal(animal);
                  } else {
                    console.error("Animal component not found for item " + item.id);
                  }
                  return _context8.abrupt("return", node);
                case 15:
                case "end":
                  return _context8.stop();
              }
            }, _callee7);
          }));
          function createAnimalNode(_x11, _x12, _x13) {
            return _createAnimalNode.apply(this, arguments);
          }
          return createAnimalNode;
        }();
        _proto.createBuildingNode = /*#__PURE__*/function () {
          var _createBuildingNode = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee8(buildingContainer, item) {
            var buildData, prefab, node, building;
            return _regeneratorRuntime().wrap(function _callee8$(_context9) {
              while (1) switch (_context9.prev = _context9.next) {
                case 0:
                  buildData = BuildDataManager.instance.findBuildDataById(item.item_id);
                  if (buildData) {
                    _context9.next = 3;
                    break;
                  }
                  return _context9.abrupt("return", null);
                case 3:
                  _context9.next = 5;
                  return ResourceManager.instance.loadPrefab(SharedDefines.PREFAB_PLACEMENT_BUILDING);
                case 5:
                  prefab = _context9.sent;
                  if (prefab) {
                    _context9.next = 8;
                    break;
                  }
                  return _context9.abrupt("return", null);
                case 8:
                  node = instantiate(prefab);
                  buildingContainer == null || buildingContainer.addChild(node);
                  //set position
                  node.setWorldPosition(new Vec3(item.x, item.y, 0));
                  //set layer building
                  node.layer = Layers.nameToLayer(SharedDefines.LAYER_BUILDING_NAME) + 1;
                  building = node.addComponent(Building);
                  if (building) {
                    building.initializeFromSceneItem(item);
                  }
                  return _context9.abrupt("return", node);
                case 15:
                case "end":
                  return _context9.stop();
              }
            }, _callee8);
          }));
          function createBuildingNode(_x14, _x15) {
            return _createBuildingNode.apply(this, arguments);
          }
          return createBuildingNode;
        }();
        _proto.onHarvest = function onHarvest(result) {
          console.log('harvest result', result);
          var networkHarvestResult = result;
          if (networkHarvestResult.success) {
            var networkHarvestResultData = networkHarvestResult.data;
            console.log('networkHarvestResultData', networkHarvestResultData);
            this.playerController.playerState.addExperience(networkHarvestResultData.exp_gained);
            this.playerController.playerState.level = networkHarvestResultData.new_level;
            var itemData = ItemDataManager.instance.getItemById(networkHarvestResultData.item_id);
            if (itemData) {
              var inventoryItem = new InventoryItem(itemData, 1);
              this.playerController.inventoryComponent.addItem(inventoryItem);
            }
          }
        }

        //#region care and treat (DEPRECATED)

        // private onCared(result: NetworkCareResult): void {
        //     console.log('cared result', result);
        //     if(result.success){
        //         const networkCareResultData = result.data;
        //         console.log('networkCareResultData',networkCareResultData);
        //         //if scene_item_type is crop, call handleOnCropCared
        //         if(networkCareResultData.scene_item_type == SceneItemType.Crop){
        //             this.handleOnCropCared(networkCareResultData);
        //         }
        //         else if(networkCareResultData.scene_item_type == SceneItemType.Animal){
        //             this.handleOnAnimalCared(networkCareResultData);
        //         }
        //     }
        // }

        // private handleOnCropCared(networkCareResultData:NetworkCareResultData): void {
        //     const plotTile = this.findPlotTileBySceneId(this.playerPlotTiles,networkCareResultData.sceneid);
        //     if(plotTile){
        //         plotTile.onCare(networkCareResultData.care_count);
        //     }

        //     if(networkCareResultData.friend_id){
        //         const friendPlotTile = this.findPlotTileBySceneId(this.friendPlotTiles,networkCareResultData.sceneid);
        //         if(friendPlotTile){
        //             friendPlotTile.onCare(networkCareResultData.care_count);
        //         }
        //         this.playerController.friendState.addDiamond(networkCareResultData.diamond_added);
        //         this.playerController.playerState.addDiamond(networkCareResultData.diamond_added);
        //     }
        // }

        // private handleOnAnimalCared(networkCareResultData:NetworkCareResultData): void {
        //     console.log(`handleOnAnimalCared start ... , networkCareResultData:${networkCareResultData}`);
        //     const animal = this.playerFence.findAnimalBySceneId(networkCareResultData.sceneid);
        //     if(animal){
        //         animal.CareCount = networkCareResultData.care_count;
        //         console.log(`handleOnAnimalCared end ... , animal:${animal.node.name} , careCount:${animal.CareCount}`);
        //     }

        //     if(networkCareResultData.friend_id){
        //         const friendAnimal = this.friendFence.findAnimalBySceneId(networkCareResultData.sceneid);
        //         if(friendAnimal){
        //             friendAnimal.CareCount = networkCareResultData.care_count;
        //         }
        //         this.playerController.friendState.addDiamond(networkCareResultData.diamond_added);
        //         this.playerController.playerState.addDiamond(networkCareResultData.diamond_added);
        //     }
        // }

        // private onTreated(result: NetworkTreatResult): void {
        //     console.log('treated result', result);
        //     if(result.success){
        //         const networkTreatResultData = result.data;
        //         console.log('networkTreatResultData', networkTreatResultData);
        //         if(networkTreatResultData.scene_item_type == SceneItemType.Crop){
        //             this.handleOnCropTreated(networkTreatResultData);
        //         }
        //         else if(networkTreatResultData.scene_item_type == SceneItemType.Animal){
        //             this.handleOnAnimalTreated(networkTreatResultData);
        //         }
        //     }
        // }

        // private handleOnCropTreated(networkTreatResultData: NetworkTreatResultData): void {
        //     const plotTile = this.findPlotTileBySceneId(this.playerPlotTiles, networkTreatResultData.sceneid);
        //     if(plotTile){
        //         plotTile.onTreat(networkTreatResultData.treat_count);
        //     }

        //     if(networkTreatResultData.friend_id){
        //         const friendPlotTile = this.findPlotTileBySceneId(this.friendPlotTiles, networkTreatResultData.sceneid);
        //         if(friendPlotTile){
        //             friendPlotTile.onTreat(networkTreatResultData.treat_count);
        //         }
        //         this.playerController.friendState.addDiamond(networkTreatResultData.diamond_added);
        //         this.playerController.playerState.addDiamond(networkTreatResultData.diamond_added);
        //     }
        // }

        // private handleOnAnimalTreated(networkTreatResultData: NetworkTreatResultData): void {
        //     console.log(`handleOnAnimalTreated start ... , networkTreatResultData:${networkTreatResultData}`);
        //     const animal = this.playerFence.findAnimalBySceneId(networkTreatResultData.sceneid);
        //     if(animal){
        //         animal.TreatCount = networkTreatResultData.treat_count;
        //         console.log(`handleOnAnimalTreated end ... , animal:${animal.node.name} , treatCount:${animal.TreatCount}`);
        //     }

        //     if(networkTreatResultData.friend_id){
        //         const friendAnimal = this.friendFence.findAnimalBySceneId(networkTreatResultData.sceneid);
        //         if(friendAnimal){
        //             friendAnimal.TreatCount = networkTreatResultData.treat_count;
        //         }
        //         this.playerController.friendState.addDiamond(networkTreatResultData.diamond_added);
        //         this.playerController.playerState.addDiamond(networkTreatResultData.diamond_added);
        //     }
        // }

        //#endregion
        ;

        _proto.visitFriend = /*#__PURE__*/
        function () {
          var _visitFriend = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee9(userId) {
            var result, playerState;
            return _regeneratorRuntime().wrap(function _callee9$(_context10) {
              while (1) switch (_context10.prev = _context10.next) {
                case 0:
                  _context10.next = 2;
                  return NetworkManager.instance.visit(userId);
                case 2:
                  result = _context10.sent;
                  if (result && result.success) {
                    console.log('visit result', result);
                    this.playerController.visitMode = true;
                    playerState = new PlayerState(result.data.userId, result.data.level, result.data.exp, 0, 0);
                    this.playerController.friendState = playerState;
                    //show friendGameplayContainer
                    this.setFriendGameViewVisibility(true);
                    this.setGameViewVisibility(false);
                    //initialize friend's scene items
                    this.initializeSceneItems(this.friendGameplayContainer, result.data.sceneItems, result.data.level, false);
                  } else {
                    console.error('visit friend failed');
                    //hide friendGameplayContainer
                    this.setFriendGameViewVisibility(false);
                    this.setGameViewVisibility(true);
                    this.playerController.visitMode = false;
                    this.playerController.friendState = null;
                  }
                case 4:
                case "end":
                  return _context10.stop();
              }
            }, _callee9, this);
          }));
          function visitFriend(_x16) {
            return _visitFriend.apply(this, arguments);
          }
          return visitFriend;
        }() //implement backToHome() method
        ;

        _proto.backToHome = function backToHome() {
          this.setFriendGameViewVisibility(false);
          this.setGameViewVisibility(true);
          this.playerController.visitMode = false;
          this.playerController.friendState = null;
        }

        //#endregion
        ;

        _createClass(GameController, [{
          key: "PlayerPlotTiles",
          get:
          //getter for playerPlotTiles
          function get() {
            return this.playerPlotTiles;
          }
        }, {
          key: "FriendPlotTiles",
          get:
          //getter for friendPlotTiles
          function get() {
            return this.friendPlotTiles;
          }
        }, {
          key: "ScreenScale",
          get:
          //getter for screenScale
          function get() {
            return this.screenScale;
          }
        }]);
        return GameController;
      }(Component), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "gameplayCanvas", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "playerControllerPrefab", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "gameplayContainer", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "friendGameplayContainer", [_dec5], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "buildingContainer", [_dec6], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      })), _class2)) || _class));
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/GameEntry.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './WindowManager.ts'], function (exports) {
  var _inheritsLoose, _asyncToGenerator, _regeneratorRuntime, cclegacy, _decorator, Component, WindowManager;
  return {
    setters: [function (module) {
      _inheritsLoose = module.inheritsLoose;
      _asyncToGenerator = module.asyncToGenerator;
      _regeneratorRuntime = module.regeneratorRuntime;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      Component = module.Component;
    }, function (module) {
      WindowManager = module.WindowManager;
    }],
    execute: function () {
      var _dec, _class;
      cclegacy._RF.push({}, "89580Z1QMpPAp5GZCRAZYVa", "GameEntry", undefined);
      var ccclass = _decorator.ccclass,
        property = _decorator.property;
      var GameEntry = exports('GameEntry', (_dec = ccclass('GameEntry'), _dec(_class = /*#__PURE__*/function (_Component) {
        _inheritsLoose(GameEntry, _Component);
        function GameEntry() {
          return _Component.apply(this, arguments) || this;
        }
        var _proto = GameEntry.prototype;
        _proto.start = function start() {
          this.initializeManagers();
          this.showMainWindow();
        };
        _proto.initializeManagers = function initializeManagers() {
          WindowManager.instance.initialize();
        };
        _proto.showMainWindow = /*#__PURE__*/function () {
          var _showMainWindow = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee() {
            return _regeneratorRuntime().wrap(function _callee$(_context) {
              while (1) switch (_context.prev = _context.next) {
                case 0:
                  _context.prev = 0;
                  _context.next = 3;
                  return WindowManager.instance.show('MainWindow');
                case 3:
                  console.log('MainWindow shown successfully');
                  _context.next = 9;
                  break;
                case 6:
                  _context.prev = 6;
                  _context.t0 = _context["catch"](0);
                  console.error('Failed to show MainWindow:', _context.t0);
                case 9:
                case "end":
                  return _context.stop();
              }
            }, _callee, null, [[0, 6]]);
          }));
          function showMainWindow() {
            return _showMainWindow.apply(this, arguments);
          }
          return showMainWindow;
        }();
        return GameEntry;
      }(Component)) || _class));
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/GameWindow.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './ResourceManager.ts', './SharedDefines.ts', './WindowBase.ts', './CropDataManager.ts', './SpriteHelper.ts', './WindowManager.ts', './CoinDisplay.ts', './DiamondDisplay.ts', './NetworkManager.ts', './DashFunManager.ts', './GradeDataManager.ts'], function (exports) {
  var _applyDecoratedDescriptor, _inheritsLoose, _initializerDefineProperty, _assertThisInitialized, _asyncToGenerator, _regeneratorRuntime, cclegacy, _decorator, Label, ProgressBar, ScrollView, Node, Button, Sprite, Color, Layout, instantiate, SpriteFrame, Widget, ResourceManager, SharedDefines, WindowBase, CropDataManager, SpriteHelper, WindowManager, CoinDisplay, DiamondDisplay, NetworkManager, DashFunManager, PayItemType, GradeDataManager;
  return {
    setters: [function (module) {
      _applyDecoratedDescriptor = module.applyDecoratedDescriptor;
      _inheritsLoose = module.inheritsLoose;
      _initializerDefineProperty = module.initializerDefineProperty;
      _assertThisInitialized = module.assertThisInitialized;
      _asyncToGenerator = module.asyncToGenerator;
      _regeneratorRuntime = module.regeneratorRuntime;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      Label = module.Label;
      ProgressBar = module.ProgressBar;
      ScrollView = module.ScrollView;
      Node = module.Node;
      Button = module.Button;
      Sprite = module.Sprite;
      Color = module.Color;
      Layout = module.Layout;
      instantiate = module.instantiate;
      SpriteFrame = module.SpriteFrame;
      Widget = module.Widget;
    }, function (module) {
      ResourceManager = module.ResourceManager;
    }, function (module) {
      SharedDefines = module.SharedDefines;
    }, function (module) {
      WindowBase = module.WindowBase;
    }, function (module) {
      CropDataManager = module.CropDataManager;
    }, function (module) {
      SpriteHelper = module.SpriteHelper;
    }, function (module) {
      WindowManager = module.WindowManager;
    }, function (module) {
      CoinDisplay = module.CoinDisplay;
    }, function (module) {
      DiamondDisplay = module.DiamondDisplay;
    }, function (module) {
      NetworkManager = module.NetworkManager;
    }, function (module) {
      DashFunManager = module.DashFunManager;
      PayItemType = module.PayItemType;
    }, function (module) {
      GradeDataManager = module.GradeDataManager;
    }],
    execute: function () {
      var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor10, _descriptor11, _descriptor12, _descriptor13, _descriptor14, _descriptor15, _descriptor16, _descriptor17;
      cclegacy._RF.push({}, "a28dabuEQNE9pj7Yu7oGB3z", "GameWindow", undefined);
      var ccclass = _decorator.ccclass,
        property = _decorator.property;
      var GameWindow = exports('GameWindow', (_dec = ccclass('GameWindow'), _dec2 = property(Label), _dec3 = property(Label), _dec4 = property(Label), _dec5 = property(ProgressBar), _dec6 = property(CoinDisplay), _dec7 = property(DiamondDisplay), _dec8 = property(ScrollView), _dec9 = property(Node), _dec10 = property(Node), _dec11 = property(ScrollView), _dec12 = property(Node), _dec13 = property(Button), _dec14 = property(Button), _dec15 = property(Button), _dec16 = property(Button), _dec17 = property(Button), _dec18 = property(Button), _dec(_class = (_class2 = /*#__PURE__*/function (_WindowBase) {
        _inheritsLoose(GameWindow, _WindowBase);
        function GameWindow() {
          var _this;
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          _this = _WindowBase.call.apply(_WindowBase, [this].concat(args)) || this;
          _initializerDefineProperty(_this, "lbUserName", _descriptor, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "lbProsperity", _descriptor2, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "lblLevel", _descriptor3, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "progressExp", _descriptor4, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "coinDisplay", _descriptor5, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "diamondDisplay", _descriptor6, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "scrollViewCrops", _descriptor7, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "cropContainer", _descriptor8, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "cropButtonTemplate", _descriptor9, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "friendScrollView", _descriptor10, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "friendButtonTemplate", _descriptor11, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "btnAddCoin", _descriptor12, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "btnAddDiamond", _descriptor13, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "btnCraft", _descriptor14, _assertThisInitialized(_this));
          //button shop
          _initializerDefineProperty(_this, "btnShop", _descriptor15, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "btnFriend", _descriptor16, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "btnBack", _descriptor17, _assertThisInitialized(_this));
          _this.cropButtons = [];
          //private gameController: GameController | null = null;
          _this.playerController = null;
          _this.currentSelectedPlot = null;
          return _this;
        }
        var _proto = GameWindow.prototype;
        _proto.initialize = function initialize() {
          _WindowBase.prototype.initialize.call(this);
          if (this.gameController) {
            var _this$gameController;
            this.playerController = (_this$gameController = this.gameController) == null ? void 0 : _this$gameController.getPlayerController();
            if (this.coinDisplay) {
              this.coinDisplay.initialize(this.playerController.playerState);
            }
            if (this.diamondDisplay) {
              this.diamondDisplay.initialize(this.playerController.playerState);
            }
          }
          this.gameController.eventTarget.on(SharedDefines.EVENT_PLOT_SELECTED, this.onPlotSelected, this);
          this.setupEventLisnters();
          this.initializeCropButtons();
        };
        _proto.show = function show() {
          var _WindowBase$prototype, _this$gameController2;
          for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            args[_key2] = arguments[_key2];
          }
          (_WindowBase$prototype = _WindowBase.prototype.show).call.apply(_WindowBase$prototype, [this].concat(args));
          //set crop container invisible
          this.scrollViewCrops.node.active = false;
          //set friendScrollView invisible
          this.friendScrollView.node.active = false;
          (_this$gameController2 = this.gameController) == null || _this$gameController2.startGame();
          if (this.coinDisplay) {
            this.coinDisplay.refreshDisplay();
          }
          if (this.diamondDisplay) {
            this.diamondDisplay.refreshDisplay();
          }
          this.refreshBasePlayerStateInfo();
          this.updateButtonsVisibility();
          this.updateRecommendedFriends();
        };
        _proto.hide = function hide() {
          _WindowBase.prototype.hide.call(this);
        }

        // update(deltaTime: number) {

        // }
        ;

        _proto.onDestroy = function onDestroy() {
          var _this$friendScrollVie;
          _WindowBase.prototype.onDestroy.call(this);
          if (this.playerController) {
            this.playerController.eventTarget.off(SharedDefines.EVENT_VISIT_MODE_CHANGE, this.updateButtonsVisibility, this);
            var playerState = this.playerController.playerState;
            playerState.eventTarget.off(SharedDefines.EVENT_PLAYER_LEVEL_UP, this.onPlayerLeveUp, this);
            playerState.eventTarget.off(SharedDefines.EVENT_PLAYER_EXP_CHANGE, this.refreshBasePlayerStateInfo, this);
          }
          DashFunManager.instance.eventTarget.off(DashFunManager.EVENT_OPEN_INVOICE_RESULT, this.onOpenInvoiceResult, this);
          var content = (_this$friendScrollVie = this.friendScrollView) == null ? void 0 : _this$friendScrollVie.content;
          if (content) {
            content.children.forEach(function (child) {
              var button = child.getComponent(Button);
              if (button) {
                button.node.off(Button.EventType.CLICK);
              }
            });
          }

          //btnCraft click event
          if (this.btnCraft) {
            this.btnCraft.node.off(Button.EventType.CLICK, this.onBtnCraftClicked, this);
          }
        };
        _proto.setupEventLisnters = function setupEventLisnters() {
          if (this.playerController) {
            this.playerController.eventTarget.on(SharedDefines.EVENT_VISIT_MODE_CHANGE, this.updateButtonsVisibility, this);
            var playerState = this.playerController.playerState;
            playerState.eventTarget.on(SharedDefines.EVENT_PLAYER_LEVEL_UP, this.onPlayerLeveUp, this);
            playerState.eventTarget.on(SharedDefines.EVENT_PLAYER_EXP_CHANGE, this.refreshBasePlayerStateInfo, this);
            playerState.eventTarget.on(SharedDefines.EVENT_PLAYER_GOLD_CHANGE, this.refreshBasePlayerStateInfo, this);
            playerState.eventTarget.on(SharedDefines.EVENT_PLAYER_DIAMOND_CHANGE, this.refreshBasePlayerStateInfo, this);
          }
          //btnAddCoin click event
          if (this.btnAddCoin) {
            this.btnAddCoin.node.on(Button.EventType.CLICK, this.onBtnAddCoinClicked, this);
          }
          //btnAddDiamond click event
          if (this.btnAddDiamond) {
            this.btnAddDiamond.node.on(Button.EventType.CLICK, this.onBtnAddDiamondClicked, this);
          }
          //btnCraft click event
          if (this.btnCraft) {
            this.btnCraft.node.on(Button.EventType.CLICK, this.onBtnCraftClicked, this);
          }
          //btnShop click event
          if (this.btnShop) {
            this.btnShop.node.on(Button.EventType.CLICK, this.onBtnShopClicked, this);
          }
          //btnFriend click event
          if (this.btnFriend) {
            this.btnFriend.node.on(Button.EventType.CLICK, this.onBtnFriendClicked, this);
          }
          if (this.btnBack) {
            this.btnBack.node.on(Button.EventType.CLICK, this.onBtnBackClicked, this);
          }
          DashFunManager.instance.eventTarget.on(DashFunManager.EVENT_OPEN_INVOICE_RESULT, this.onOpenInvoiceResult, this);
        };
        _proto.updateButtonsVisibility = function updateButtonsVisibility() {
          var _this$gameController$, _this$gameController3;
          //check if is visit mode
          var visitMode = (_this$gameController$ = (_this$gameController3 = this.gameController) == null ? void 0 : _this$gameController3.getPlayerController().visitMode) != null ? _this$gameController$ : false;
          console.log("updateButtonsVisibility " + visitMode);
          this.btnFriend.enabled = !visitMode;
          this.btnShop.enabled = !visitMode;
          this.btnCraft.enabled = !visitMode;
          this.btnBack.node.active = visitMode;
          if (visitMode) {
            SpriteHelper.setSpriteColor(this.btnShop.getComponent(Sprite), Color.GRAY);
            SpriteHelper.setSpriteColor(this.btnCraft.getComponent(Sprite), Color.GRAY);
            SpriteHelper.setSpriteColor(this.btnFriend.getComponent(Sprite), Color.GRAY);
          } else {
            SpriteHelper.setSpriteColor(this.btnShop.getComponent(Sprite), Color.WHITE);
            SpriteHelper.setSpriteColor(this.btnCraft.getComponent(Sprite), Color.WHITE);
            SpriteHelper.setSpriteColor(this.btnFriend.getComponent(Sprite), Color.WHITE);
          }
        };
        _proto.onPlayerLeveUp = function onPlayerLeveUp() {
          this.refreshBasePlayerStateInfo();
        };
        _proto.initializeCropButtons = function initializeCropButtons() {
          var _this$playerControlle,
            _this2 = this;
          if (!this.cropButtonTemplate || !this.scrollViewCrops) {
            console.error('Crop button template or scroll view content is not set');
            return;
          }
          //clear all cropButtons
          for (var i = 0; i < this.cropButtons.length; ++i) {
            this.cropButtons[i].destroy();
            this.cropButtons[i] = null;
          }
          this.cropButtons = [];
          var cropDataList = CropDataManager.instance.getAllCropData();
          var playerLevel = ((_this$playerControlle = this.playerController) == null ? void 0 : _this$playerControlle.playerState.level) || 1;
          var lastCropType = -1;
          var content = this.scrollViewCrops.content;
          var _loop = function _loop() {
            var cropData = cropDataList[_i];
            //check if croptype == -1 or croptype != cropdata.croptype
            var curCropType = parseInt(cropData.crop_type);
            // console.log('curCropType: ' + curCropType + ',' + ' lastCropType: ' + lastCropType);
            if (!(lastCropType === -1 || curCropType !== lastCropType)) {
              return 1; // continue
            }

            lastCropType = parseInt(cropData.crop_type);
            var buttonNode = instantiate(_this2.cropButtonTemplate);
            buttonNode.name = cropData.id;
            buttonNode.active = parseInt(cropData.level_need) <= playerLevel;
            content.addChild(buttonNode);
            //if editor

            if (cropData.icon !== '') {
              var buttonSprite = buttonNode.getComponent(Sprite);
              ResourceManager.instance.loadAsset("" + SharedDefines.WINDOW_GAME_TEXTURES + cropData.icon + '/spriteFrame', SpriteFrame).then(function (texture) {
                if (texture) {
                  buttonSprite.spriteFrame = texture;
                }
              });
            }
            buttonNode.on(Button.EventType.CLICK, function () {
              return _this2.onCropButtonClicked(parseInt(cropData.crop_type));
            }, _this2);
            _this2.cropButtons.push(buttonNode);
          };
          for (var _i = 0; _i < cropDataList.length; ++_i) {
            if (_loop()) continue;
          }
          var layout = content.getComponent(Layout);
          if (layout) {
            layout.updateLayout();
          }
        };
        _proto.refreshBasePlayerStateInfo = function refreshBasePlayerStateInfo() {
          if (!this.gameController || this.playerController === null) {
            console.error('GameController or playerController is not set');
            return;
          }
          var playerState = this.playerController.playerState;
          console.log("refreshBasePlayerStateInfo: level: " + playerState.level);
          if (this.lbUserName) ;
          if (this.lbProsperity) {
            this.lbProsperity.string = playerState.prosperity.toString();
            console.log('playerState.prosperity: ' + playerState.prosperity);
          }
          if (this.lblLevel) {
            this.lblLevel.string = playerState.level.toString();
          }
          if (this.progressExp) {
            var currentExp = playerState.experience;
            console.log('currentExp: ' + currentExp);
            var expNeededForNextLevel = this.getExpNeededForNextLevel(playerState.level);
            this.progressExp.progress = currentExp / expNeededForNextLevel;
          }
          if (this.coinDisplay) {
            this.coinDisplay.refreshDisplay();
          }
          if (this.diamondDisplay) {
            this.diamondDisplay.refreshDisplay();
          }
        };
        _proto.getExpNeededForNextLevel = function getExpNeededForNextLevel(level) {
          return GradeDataManager.instance.getExpNeededForLevel(level + 1);
        };
        _proto.onCropButtonClicked = /*#__PURE__*/function () {
          var _onCropButtonClicked = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(cropType) {
            return _regeneratorRuntime().wrap(function _callee$(_context) {
              while (1) switch (_context.prev = _context.next) {
                case 0:
                  console.log('onCropButtonClicked: ' + cropType);
                //this.plantCrop(cropType);
                case 1:
                case "end":
                  return _context.stop();
              }
            }, _callee);
          }));
          function onCropButtonClicked(_x) {
            return _onCropButtonClicked.apply(this, arguments);
          }
          return onCropButtonClicked;
        }() //create onPlotSelected func , when plot is selected, show crop container
        ;

        _proto.onPlotSelected = function onPlotSelected(plot) {
          if (plot.isOccupied) return;
          this.scrollViewCrops.node.active = true;
          this.currentSelectedPlot = plot;
        };
        _proto.onBtnAddCoinClicked = function onBtnAddCoinClicked() {
          DashFunManager.instance.requestPayment("金币*100", "购买金币", PayItemType.Coin, 1);
          // this.playerController?.playerState.addCoin(100);
        };

        _proto.onBtnAddDiamondClicked = function onBtnAddDiamondClicked() {
          DashFunManager.instance.requestPayment("钻石*100", "购买钻石", PayItemType.Diamond, 1);
          // this.playerController?.playerState.addDiamond(100);
        };

        _proto.onBtnCraftClicked = function onBtnCraftClicked() {
          WindowManager.instance.show(SharedDefines.WINDOW_CRAFT_NAME);
        }

        //btnshop clicked
        ;

        _proto.onBtnShopClicked = function onBtnShopClicked() {
          WindowManager.instance.show(SharedDefines.WINDOW_SHOP_NAME);
        };
        _proto.onBtnFriendClicked = /*#__PURE__*/function () {
          var _onBtnFriendClicked = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2() {
            var widget;
            return _regeneratorRuntime().wrap(function _callee2$(_context2) {
              while (1) switch (_context2.prev = _context2.next) {
                case 0:
                  //toggle friendScrollView
                  this.friendScrollView.node.active = !this.friendScrollView.node.active;
                  console.log('onBtnFriendClicked');
                  // this.gameController?.visitFriend("123");
                  widget = this.friendScrollView.content.getComponent(Widget);
                  if (widget) {
                    widget.updateAlignment();
                  }
                case 4:
                case "end":
                  return _context2.stop();
              }
            }, _callee2, this);
          }));
          function onBtnFriendClicked() {
            return _onBtnFriendClicked.apply(this, arguments);
          }
          return onBtnFriendClicked;
        }();
        _proto.onBtnBackClicked = function onBtnBackClicked() {
          var _this$gameController4;
          (_this$gameController4 = this.gameController) == null || _this$gameController4.backToHome();
        };
        _proto.updateRecommendedFriends = /*#__PURE__*/function () {
          var _updateRecommendedFriends = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee3() {
            var _this$playerControlle2;
            var userId, result;
            return _regeneratorRuntime().wrap(function _callee3$(_context3) {
              while (1) switch (_context3.prev = _context3.next) {
                case 0:
                  if (!(!this.friendScrollView || !this.friendButtonTemplate)) {
                    _context3.next = 3;
                    break;
                  }
                  console.error('Friend ScrollView or button template is not set');
                  return _context3.abrupt("return");
                case 3:
                  userId = (_this$playerControlle2 = this.playerController) == null ? void 0 : _this$playerControlle2.playerState.id;
                  if (userId) {
                    _context3.next = 7;
                    break;
                  }
                  console.error('User ID is not available');
                  return _context3.abrupt("return");
                case 7:
                  _context3.next = 9;
                  return NetworkManager.instance.recommendFriends(userId, 5);
                case 9:
                  result = _context3.sent;
                  if (result && result.success) {
                    //log all data
                    console.log(result.data);
                    this.populateFriendScrollView(result.data);
                  } else {
                    console.error('Failed to get recommended friends');
                  }
                case 11:
                case "end":
                  return _context3.stop();
              }
            }, _callee3, this);
          }));
          function updateRecommendedFriends() {
            return _updateRecommendedFriends.apply(this, arguments);
          }
          return updateRecommendedFriends;
        }();
        _proto.populateFriendScrollView = function populateFriendScrollView(friendsData) {
          var _this3 = this;
          var content = this.friendScrollView.content;
          //remove all children except friendButtonTemplate
          content.children.forEach(function (child) {
            if (child !== _this3.friendButtonTemplate) {
              child.destroy();
            }
          });
          friendsData.forEach(function (friend) {
            var buttonNode = instantiate(_this3.friendButtonTemplate);
            buttonNode.active = true;
            content.addChild(buttonNode);
            buttonNode.name = friend.id;

            // Set friend name
            // const nameLabel = buttonNode.getChildByName('NameLabel')?.getComponent(Label);
            // if (nameLabel) {
            //     nameLabel.string = friend.name;
            // }

            // Set friend avatar (assuming there's an avatar URL in the friend data)
            if (friend.avatarUrl) {
              var avatarSprite = buttonNode.getComponent(Sprite);
              if (avatarSprite && friend.avatarUrl) {
                // Load and set avatar sprite frame
                ResourceManager.instance.loadAsset(friend.avatarUrl, SpriteFrame).then(function (spriteFrame) {
                  if (spriteFrame) {
                    avatarSprite.spriteFrame = spriteFrame;
                  }
                });
              }
            }
            // Add click event to visit friend
            var button = buttonNode.getComponent(Button);
            if (button) {
              button.node.on(Button.EventType.CLICK, function () {
                return _this3.onFriendButtonClicked(friend.id);
              }, _this3);
            }
          });
          var layout = content.getComponent(Layout);
          if (layout) {
            layout.updateLayout();
          }
        };
        _proto.onFriendButtonClicked = function onFriendButtonClicked(friendUserId) {
          var _this$gameController5;
          (_this$gameController5 = this.gameController) == null || _this$gameController5.visitFriend(friendUserId);
        };
        _proto.onOpenInvoiceResult = function onOpenInvoiceResult(success, type, amount) {
          console.log("onOpenInvoiceResult success: " + success + ", type: " + type + ", amount: " + amount);
          if (success) {
            if (type == PayItemType.Coin) {
              var _this$playerControlle3;
              (_this$playerControlle3 = this.playerController) == null || _this$playerControlle3.playerState.addGold(amount);
            } else if (type == PayItemType.Diamond) {
              var _this$playerControlle4;
              (_this$playerControlle4 = this.playerController) == null || _this$playerControlle4.playerState.addDiamond(amount);
            }
          }
        };
        return GameWindow;
      }(WindowBase), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "lbUserName", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "lbProsperity", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "lblLevel", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "progressExp", [_dec5], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "coinDisplay", [_dec6], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "diamondDisplay", [_dec7], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "scrollViewCrops", [_dec8], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "cropContainer", [_dec9], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "cropButtonTemplate", [_dec10], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor10 = _applyDecoratedDescriptor(_class2.prototype, "friendScrollView", [_dec11], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor11 = _applyDecoratedDescriptor(_class2.prototype, "friendButtonTemplate", [_dec12], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor12 = _applyDecoratedDescriptor(_class2.prototype, "btnAddCoin", [_dec13], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor13 = _applyDecoratedDescriptor(_class2.prototype, "btnAddDiamond", [_dec14], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor14 = _applyDecoratedDescriptor(_class2.prototype, "btnCraft", [_dec15], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor15 = _applyDecoratedDescriptor(_class2.prototype, "btnShop", [_dec16], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor16 = _applyDecoratedDescriptor(_class2.prototype, "btnFriend", [_dec17], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor17 = _applyDecoratedDescriptor(_class2.prototype, "btnBack", [_dec18], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      })), _class2)) || _class));
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/GradeDataManager.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './ResourceManager.ts', './SharedDefines.ts'], function (exports) {
  var _createClass, _asyncToGenerator, _regeneratorRuntime, cclegacy, JsonAsset, ResourceManager, SharedDefines;
  return {
    setters: [function (module) {
      _createClass = module.createClass;
      _asyncToGenerator = module.asyncToGenerator;
      _regeneratorRuntime = module.regeneratorRuntime;
    }, function (module) {
      cclegacy = module.cclegacy;
      JsonAsset = module.JsonAsset;
    }, function (module) {
      ResourceManager = module.ResourceManager;
    }, function (module) {
      SharedDefines = module.SharedDefines;
    }],
    execute: function () {
      cclegacy._RF.push({}, "5f8d3+tVIFA4KcRsTNRgAV4", "GradeDataManager", undefined);
      var GradeDataManager = exports('GradeDataManager', /*#__PURE__*/function () {
        function GradeDataManager() {
          this.gradeDataMap = new Map();
        }
        var _proto = GradeDataManager.prototype;
        _proto.initialize = /*#__PURE__*/function () {
          var _initialize = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee() {
            var _this = this;
            var jsonAsset, gradeDataList;
            return _regeneratorRuntime().wrap(function _callee$(_context) {
              while (1) switch (_context.prev = _context.next) {
                case 0:
                  _context.next = 2;
                  return ResourceManager.instance.loadAsset(SharedDefines.JSON_GRADE_DATA, JsonAsset);
                case 2:
                  jsonAsset = _context.sent;
                  if (jsonAsset && jsonAsset.json) {
                    gradeDataList = jsonAsset.json.list;
                    gradeDataList.forEach(function (gradeData) {
                      _this.gradeDataMap.set(gradeData.level, gradeData);
                    });
                  }
                case 4:
                case "end":
                  return _context.stop();
              }
            }, _callee);
          }));
          function initialize() {
            return _initialize.apply(this, arguments);
          }
          return initialize;
        }();
        _proto.getGradeData = function getGradeData(level) {
          return this.gradeDataMap.get(level);
        };
        _proto.getExpNeededForLevel = function getExpNeededForLevel(level) {
          var gradeData = this.getGradeData(level);
          return gradeData ? gradeData.exp_need : 0;
        };
        _createClass(GradeDataManager, null, [{
          key: "instance",
          get: function get() {
            if (!this._instance) {
              this._instance = new GradeDataManager();
            }
            return this._instance;
          }
        }]);
        return GradeDataManager;
      }());
      GradeDataManager._instance = void 0;
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/GrowthableEntity.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './SharedDefines.ts', './CooldownComponent.ts', './ResourceManager.ts', './NetworkManager.ts', './DateHelper.ts', './SceneEntity.ts'], function (exports) {
  var _applyDecoratedDescriptor, _inheritsLoose, _initializerDefineProperty, _assertThisInitialized, _createClass, _asyncToGenerator, _regeneratorRuntime, cclegacy, _decorator, Sprite, SpriteFrame, EventTarget, Node, GrowState, CommandType, CommandState, SharedDefines, SceneItemState, CooldownComponent, ResourceManager, NetworkManager, DateHelper, SceneEntity;
  return {
    setters: [function (module) {
      _applyDecoratedDescriptor = module.applyDecoratedDescriptor;
      _inheritsLoose = module.inheritsLoose;
      _initializerDefineProperty = module.initializerDefineProperty;
      _assertThisInitialized = module.assertThisInitialized;
      _createClass = module.createClass;
      _asyncToGenerator = module.asyncToGenerator;
      _regeneratorRuntime = module.regeneratorRuntime;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      Sprite = module.Sprite;
      SpriteFrame = module.SpriteFrame;
      EventTarget = module.EventTarget;
      Node = module.Node;
    }, function (module) {
      GrowState = module.GrowState;
      CommandType = module.CommandType;
      CommandState = module.CommandState;
      SharedDefines = module.SharedDefines;
      SceneItemState = module.SceneItemState;
    }, function (module) {
      CooldownComponent = module.CooldownComponent;
    }, function (module) {
      ResourceManager = module.ResourceManager;
    }, function (module) {
      NetworkManager = module.NetworkManager;
    }, function (module) {
      DateHelper = module.DateHelper;
    }, function (module) {
      SceneEntity = module.SceneEntity;
    }],
    execute: function () {
      var _dec, _dec2, _dec3, _dec4, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor10, _descriptor11, _descriptor12, _class3;
      cclegacy._RF.push({}, "e2fa9bXJkVDdKpGexxIuq5a", "GrowthableEntity", undefined);
      var ccclass = _decorator.ccclass,
        property = _decorator.property;
      var GrowthableEntity = exports('GrowthableEntity', (_dec = ccclass('GrowthableEntity'), _dec2 = property(Sprite), _dec3 = property(Sprite), _dec4 = property(SpriteFrame), _dec(_class = (_class2 = (_class3 = /*#__PURE__*/function (_SceneEntity) {
        _inheritsLoose(GrowthableEntity, _SceneEntity);
        function GrowthableEntity() {
          var _this;
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          _this = _SceneEntity.call.apply(_SceneEntity, [this].concat(args)) || this;
          _initializerDefineProperty(_this, "id", _descriptor, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "description", _descriptor2, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "farmType", _descriptor3, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "timeMin", _descriptor4, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "growthTime", _descriptor5, _assertThisInitialized(_this));
          // in seconds
          _initializerDefineProperty(_this, "levelNeed", _descriptor6, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "sprite", _descriptor7, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "sickSprite", _descriptor8, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "deadSpriteFrame", _descriptor9, _assertThisInitialized(_this));
          _this.growthStages = [];
          _this.currentGrowthStageIndex = 0;
          _this.sourceInventoryItem = null;
          _this.cooldownComponent = null;
          _this.growState = GrowState.NONE;
          _this.harvestItemId = '';
          _this.baseSpritePath = '';
          _this.eventTarget = new EventTarget();
          _this.sceneItem = null;
          _this.totalGrowthTime = 0;
          _this.growthStartTime = 0;
          _this.isSick = false;
          _initializerDefineProperty(_this, "careCount", _descriptor10, _assertThisInitialized(_this));
          _this.careCooldown = 0;
          _this.lastCareTime = 0;
          _initializerDefineProperty(_this, "treatCount", _descriptor11, _assertThisInitialized(_this));
          _this.treatCooldown = 0;
          _this.lastTreatTime = 0;
          _initializerDefineProperty(_this, "cleanseCount", _descriptor12, _assertThisInitialized(_this));
          _this.cleanseCooldown = 0;
          _this.lastCleanseTime = 0;
          return _this;
        }
        var _proto = GrowthableEntity.prototype;
        _proto.onLoad = function onLoad() {
          this.cooldownComponent = this.getComponent(CooldownComponent);
          if (!this.cooldownComponent) {
            this.cooldownComponent = this.addComponent(CooldownComponent);
          }
        };
        _proto.initializeWithInventoryItem = function initializeWithInventoryItem(inventoryItem) {
          this.sickSprite.node.active = false;
          this.sourceInventoryItem = inventoryItem;
          this.init(inventoryItem.detailId, true);
          this.initialize(inventoryItem.detailId);
        };
        _proto.initializeWithSceneItem = function initializeWithSceneItem(sceneItem, isPlayerOwner) {
          console.log("initializeWithSceneItem , id = " + sceneItem.id);
          this.init(sceneItem.id, isPlayerOwner);
          this.sceneItem = sceneItem;
          this.growState = GrowState.NONE;
          this.isPlayerOwner = isPlayerOwner;
          this.loadEntityData(sceneItem.item_id);
          if (this.growthStages.length > 0) {
            this.setupDataFromSceneItem(sceneItem);
          } else {
            console.error("No growth stages found for entity with id: " + sceneItem.item_id);
            return;
          }
          //log current growth stage index
          console.log("current growth stage index: " + this.currentGrowthStageIndex);
          this.updateSprite("" + this.baseSpritePath + this.growthStages[this.currentGrowthStageIndex].png);
          if (this.isPlayerOwner) {
            //only player owner can update disease status
            var lastUpdateTime = DateHelper.stringToDate(sceneItem.last_updated_time) || new Date();
            if (sceneItem.commands) {
              var diseaseCommand = sceneItem.commands.find(function (command) {
                return command.type === CommandType.Disease;
              });
              if (diseaseCommand) {
                lastUpdateTime = DateHelper.stringToDate(diseaseCommand.last_updated_time);
              }
            }
            this.scheduleDiseaseStatusUpdate(lastUpdateTime);
          } else {
            //The friends can only see the disease status
            //check sceneItem.commands to see if there is any disease command
            var _diseaseCommand = sceneItem.commands.find(function (command) {
              return command.type === CommandType.Disease;
            });
            if (_diseaseCommand) {
              this.isSick = _diseaseCommand.state === CommandState.InProgress && _diseaseCommand.count == 1;
              console.log("Entity " + this.id + " has become sick");
              this.updateEntityState();
            } else {
              this.isSick = false;
            }
          }
        };
        _proto.setupDataFromSceneItem = function setupDataFromSceneItem(sceneItem) {
          var _sceneItem$commands$f, _sceneItem$commands$f2, _sceneItem$commands$f3;
          this.id = sceneItem.item_id;
          this.careCount = sceneItem.commands && ((_sceneItem$commands$f = sceneItem.commands.find(function (command) {
            return command.type === CommandType.Care;
          })) == null ? void 0 : _sceneItem$commands$f.count) || 0;
          this.treatCount = sceneItem.commands && ((_sceneItem$commands$f2 = sceneItem.commands.find(function (command) {
            return command.type === CommandType.Treat;
          })) == null ? void 0 : _sceneItem$commands$f2.count) || 0;
          this.cleanseCount = sceneItem.commands && ((_sceneItem$commands$f3 = sceneItem.commands.find(function (command) {
            return command.type === CommandType.Cleanse;
          })) == null ? void 0 : _sceneItem$commands$f3.count) || 0;
          console.log("careCount = " + this.careCount + " , treatCount = " + this.treatCount + " , cleanseCount = " + this.cleanseCount);
          this.updateTotalGrowthTime();
          this.growthStartTime = DateHelper.stringToDate(sceneItem.last_updated_time).getTime() / 1000;
          var remainingTime = this.calculateRemainingTime();
          this.currentGrowthStageIndex = this.calculateCurrentStage(remainingTime);
          this.setupData(this.growthStages[this.currentGrowthStageIndex]);
          this.growthTime = remainingTime * SharedDefines.TIME_MINUTE;
          //log growth time
          console.log("growth time: " + this.growthTime);
          if (sceneItem.state === SceneItemState.Dead) {
            this.setDeadState();
          } else {
            this.updateSickState();
          }
        };
        _proto.updateTotalGrowthTime = function updateTotalGrowthTime() {
          var baseTime = this.growthStages.reduce(function (total, data) {
            return total + parseInt(data.time_min);
          }, 0);
          var careReduction = SharedDefines.CARE_TIME_RATIO_REDUCE * this.careCount;
          var treatReduction = SharedDefines.TREAT_TIME_RATIO_REDUCE * this.treatCount;
          this.totalGrowthTime = baseTime * (1 - (careReduction + treatReduction));
        };
        _proto.calculateRemainingTime = function calculateRemainingTime() {
          var currentTime = Date.now() / 1000;
          var elapsedTime = (currentTime - this.growthStartTime) / 60;
          return Math.max(0, this.totalGrowthTime - elapsedTime);
        };
        _proto.calculateCurrentStage = function calculateCurrentStage(remainingTime) {
          var elapsedTime = this.totalGrowthTime - remainingTime;
          var accumulatedTime = 0;
          var expectedStageIndex = 0;
          if (elapsedTime >= this.totalGrowthTime) {
            expectedStageIndex = this.growthStages.length - 1;
          } else {
            for (var i = 0; i < this.growthStages.length; i++) {
              accumulatedTime += parseInt(this.growthStages[i].time_min);
              if (elapsedTime >= accumulatedTime) {
                expectedStageIndex = i;
              }
            }
          }
          return expectedStageIndex;
        };
        _proto.updateSprite = /*#__PURE__*/function () {
          var _updateSprite = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(pngPath) {
            var _this2 = this;
            var _this$sceneItem;
            return _regeneratorRuntime().wrap(function _callee$(_context) {
              while (1) switch (_context.prev = _context.next) {
                case 0:
                  if (!this.sprite) {
                    _context.next = 6;
                    break;
                  }
                  if (!(((_this$sceneItem = this.sceneItem) == null ? void 0 : _this$sceneItem.state) === SceneItemState.Dead)) {
                    _context.next = 5;
                    break;
                  }
                  this.sprite.spriteFrame = this.deadSpriteFrame;
                  _context.next = 6;
                  break;
                case 5:
                  return _context.abrupt("return", ResourceManager.instance.loadAsset(pngPath + '/spriteFrame', SpriteFrame).then(function (texture) {
                    if (texture) {
                      _this2.sprite.spriteFrame = texture;
                    }
                  }));
                case 6:
                  return _context.abrupt("return", Promise.resolve());
                case 7:
                case "end":
                  return _context.stop();
              }
            }, _callee, this);
          }));
          function updateSprite(_x) {
            return _updateSprite.apply(this, arguments);
          }
          return updateSprite;
        }();
        _proto.startGrowing = function startGrowing() {
          console.log("start growing ");
          if (this.sceneItem) {
            if (this.sceneItem.state === SceneItemState.Complete) {
              this.onGrowthComplete();
            } else if (this.sceneItem.state === SceneItemState.InProgress) {
              this.continueGrowing(this.sceneItem);
            }
          } else {
            this.growState = GrowState.GROWING;
            this.updateSprite("" + this.baseSpritePath + this.growthStages[this.currentGrowthStageIndex].png);
            this.requestNextGrowth();
          }
        };
        _proto.continueGrowing = function continueGrowing(sceneItem) {
          this.growState = GrowState.GROWING;
          this.updateSprite("" + this.baseSpritePath + this.growthStages[this.currentGrowthStageIndex].png);
          this.scheduleNextGrowth();
        };
        _proto.scheduleNextGrowth = function scheduleNextGrowth() {
          var _this3 = this;
          if (!this.isGrowEnd()) {
            this.CooldownComponent.startCooldown('growth', this.growthTime, function () {
              return _this3.grow();
            });
          } else {
            this.onGrowthComplete();
          }
        };
        _proto.requestNextGrowth = /*#__PURE__*/function () {
          var _requestNextGrowth = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2() {
            var _this4 = this;
            var latestDuration, remainingTime, _this$cooldownCompone, _this$cooldownCompone2;
            return _regeneratorRuntime().wrap(function _callee2$(_context2) {
              while (1) switch (_context2.prev = _context2.next) {
                case 0:
                  console.log("request next growth ");
                  _context2.prev = 1;
                  _context2.next = 4;
                  return this.getLatestCommandDuration();
                case 4:
                  latestDuration = _context2.sent;
                  if (latestDuration !== null) {
                    this.updateGrowthTimes(latestDuration);
                  }
                  this.updateTotalGrowthTime();
                  remainingTime = this.calculateRemainingTime();
                  console.log("remainingTime = " + remainingTime);
                  if (remainingTime <= 0 && this.isGrowEnd()) {
                    this.onGrowthComplete();
                  } else {
                    (_this$cooldownCompone = this.cooldownComponent) == null || _this$cooldownCompone.startCooldown('growth', remainingTime * SharedDefines.TIME_MINUTE, function () {
                      return _this4.grow();
                    });
                  }
                  _context2.next = 16;
                  break;
                case 12:
                  _context2.prev = 12;
                  _context2.t0 = _context2["catch"](1);
                  console.error('Failed to get latest command duration:', _context2.t0);
                  (_this$cooldownCompone2 = this.cooldownComponent) == null || _this$cooldownCompone2.startCooldown('growth', this.calculateRemainingTime(), function () {
                    return _this4.grow();
                  });
                case 16:
                case "end":
                  return _context2.stop();
              }
            }, _callee2, this, [[1, 12]]);
          }));
          function requestNextGrowth() {
            return _requestNextGrowth.apply(this, arguments);
          }
          return requestNextGrowth;
        }();
        _proto.updateGrowthTimes = function updateGrowthTimes(latestDuration) {
          var remainingTime = this.calculateRemainingTime();
          this.currentGrowthStageIndex = this.calculateCurrentStage(remainingTime);
          if (this.currentGrowthStageIndex >= this.growthStages.length) {
            this.currentGrowthStageIndex = this.growthStages.length - 1;
          }
          this.setupData(this.growthStages[this.currentGrowthStageIndex]);
          var newSpritePath = "" + this.baseSpritePath + this.growthStages[this.currentGrowthStageIndex].png;
          this.updateSprite(newSpritePath);
        };
        _proto.grow = function grow() {
          this.currentGrowthStageIndex++;
          this.setupData(this.growthStages[this.currentGrowthStageIndex]);
          this.updateSprite("" + this.baseSpritePath + this.growthStages[this.currentGrowthStageIndex].png);
          this.requestNextGrowth();
        };
        _proto.onGrowthComplete = function onGrowthComplete() {
          console.log("growth complete , current growth stage index: " + this.currentGrowthStageIndex);
          this.growState = GrowState.HARVESTING;
          this.eventTarget.emit(GrowthableEntity.growthCompleteEvent, this);
          if (this.isPlayerOwner) {
            this.node.on(Node.EventType.TOUCH_END, this.harvest, this);
          }
          console.log("growth complete , growState = " + this.growState);
        };
        _proto.getLatestCommandDuration = /*#__PURE__*/function () {
          var _getLatestCommandDuration = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee3() {
            var _this$sceneItem2;
            var response;
            return _regeneratorRuntime().wrap(function _callee3$(_context3) {
              while (1) switch (_context3.prev = _context3.next) {
                case 0:
                  if ((_this$sceneItem2 = this.sceneItem) != null && _this$sceneItem2.id) {
                    _context3.next = 3;
                    break;
                  }
                  console.warn('Scene item ID is not set');
                  return _context3.abrupt("return", null);
                case 3:
                  _context3.prev = 3;
                  _context3.next = 6;
                  return NetworkManager.instance.getLatestCommandDuration(this.sceneItem.id, !this.isPlayerOwner ? this.sceneItem.userid : null);
                case 6:
                  response = _context3.sent;
                  if (!response.success) {
                    _context3.next = 11;
                    break;
                  }
                  return _context3.abrupt("return", response.duration);
                case 11:
                  console.warn('Failed to get latest command duration:', response.message);
                  return _context3.abrupt("return", null);
                case 13:
                  _context3.next = 19;
                  break;
                case 15:
                  _context3.prev = 15;
                  _context3.t0 = _context3["catch"](3);
                  console.error('Error getting latest command duration:', _context3.t0);
                  return _context3.abrupt("return", null);
                case 19:
                case "end":
                  return _context3.stop();
              }
            }, _callee3, this, [[3, 15]]);
          }));
          function getLatestCommandDuration() {
            return _getLatestCommandDuration.apply(this, arguments);
          }
          return getLatestCommandDuration;
        }();
        _proto.setPosition = function setPosition(position) {
          this.node.position = position;
        };
        _proto.onDragStart = function onDragStart() {};
        _proto.onDragging = function onDragging(newPosition) {
          this.setPosition(newPosition);
        };
        _proto.onDragEnd = function onDragEnd(endPosition, isDestroy) {
          if (isDestroy) {
            this.node.destroy();
            return true;
          }
          return true;
        };
        _proto.stopGrowth = function stopGrowth() {
          var _this$CooldownCompone;
          console.log("stop growth , growState = " + this.growState);
          (_this$CooldownCompone = this.CooldownComponent) == null || _this$CooldownCompone.removeCooldown('growth');
          this.growState = GrowState.NONE;
        }

        //abstract canHarvest
        ;

        _proto.isGrowEnd = function isGrowEnd() {
          return this.growthTime == 0;
        }

        //#region Care, Treat, Cleanse
        ;
        //#endregion
        _proto.updateDiseaseStatus = /*#__PURE__*/
        function () {
          var _updateDiseaseStatus = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee4(updateDiseaseTimes) {
            var _this$sceneItem3;
            var lastUpdateTime, result, diseaseCommandIndex;
            return _regeneratorRuntime().wrap(function _callee4$(_context4) {
              while (1) switch (_context4.prev = _context4.next) {
                case 0:
                  if (updateDiseaseTimes === void 0) {
                    updateDiseaseTimes = 1;
                  }
                  if (!(!this.sceneItem || !this.sceneItem.id)) {
                    _context4.next = 4;
                    break;
                  }
                  console.warn('Cannot update disease status: Scene item or ID is not set');
                  return _context4.abrupt("return");
                case 4:
                  lastUpdateTime = DateHelper.stringToDate((_this$sceneItem3 = this.sceneItem) == null ? void 0 : _this$sceneItem3.last_updated_time) || new Date();
                  _context4.prev = 5;
                  _context4.next = 8;
                  return NetworkManager.instance.updateDiseaseStatus(this.sceneItem.id, updateDiseaseTimes);
                case 8:
                  result = _context4.sent;
                  if (result && result.success) {
                    if (result.is_sick) {
                      this.isSick = true;
                      this.updateSickState();
                      console.log("Entity " + this.id + " has become sick");
                    }
                    //update last_updated_time for this.sceneItem?.commands.find(cmd => cmd.type === CommandType.Disease)
                    diseaseCommandIndex = this.sceneItem.commands.findIndex(function (cmd) {
                      return cmd.type === CommandType.Disease;
                    });
                    if (diseaseCommandIndex !== -1 && result.last_updated_time) {
                      this.sceneItem.commands[diseaseCommandIndex].last_updated_time = result.last_updated_time;
                      console.log("update disease status success, last_updated_time = " + result.last_updated_time);
                    } else {
                      console.warn("update disease status failed , diseaseCommandIndex = " + diseaseCommandIndex + " , result.last_updated_time = " + result.last_updated_time);
                    }
                    if (result.last_updated_time) {
                      lastUpdateTime = DateHelper.stringToDate(result.last_updated_time);
                    }
                  }
                  _context4.next = 15;
                  break;
                case 12:
                  _context4.prev = 12;
                  _context4.t0 = _context4["catch"](5);
                  console.error('Failed to update disease status:', _context4.t0);
                case 15:
                  this.scheduleDiseaseStatusUpdate(lastUpdateTime);
                case 16:
                case "end":
                  return _context4.stop();
              }
            }, _callee4, this, [[5, 12]]);
          }));
          function updateDiseaseStatus(_x2) {
            return _updateDiseaseStatus.apply(this, arguments);
          }
          return updateDiseaseStatus;
        }();
        _proto.scheduleDiseaseStatusUpdate = function scheduleDiseaseStatusUpdate(last_updated_time) {
          var _this$sceneItem4, _this$sceneItem5;
          if (((_this$sceneItem4 = this.sceneItem) == null ? void 0 : _this$sceneItem4.state) === SceneItemState.Dead) {
            this.updateEntityState();
            this.stopDiseaseStatusUpdates();
            return;
          }
          var currentTime = Date.now() / 1000;
          var interval = SharedDefines.DISEASE_STATUS_UPDATE_INTERVAL;
          var diseaseCommand = (_this$sceneItem5 = this.sceneItem) == null ? void 0 : _this$sceneItem5.commands.find(function (cmd) {
            return cmd.type === CommandType.Disease;
          });
          if (diseaseCommand && diseaseCommand.state === CommandState.InProgress) {
            this.isSick = true;
            this.updateSickState();
            console.log("Entity " + this.id + " has become sick");
          } else {
            this.isSick = false;
            this.updateSickState();
          }
          var lastUpdateTime = last_updated_time.getTime() / 1000;
          var timeSinceLastUpdate = currentTime - lastUpdateTime;
          var missedIntervals = Math.floor(timeSinceLastUpdate / interval);
          if (missedIntervals > 0) {
            console.log("Missed intervals: " + missedIntervals);
            this.updateDiseaseStatus(missedIntervals);
          }
          var nextUpdateTime = interval - timeSinceLastUpdate % interval;
          console.log("Next disease update time: " + nextUpdateTime);
          this.unschedule(this.updateDiseaseStatus);
          this.scheduleOnce(this.updateDiseaseStatus, nextUpdateTime);
        };
        _proto.stopDiseaseStatusUpdates = function stopDiseaseStatusUpdates() {
          this.unschedule(this.updateDiseaseStatus);
        };
        _proto.setImmunityDuration = function setImmunityDuration(immunityDuration, lastUpdateTime) {
          var _this5 = this;
          this.isSick = false;
          this.updateSickState();
          this.unschedule(this.updateDiseaseStatus);
          this.scheduleOnce(function () {
            _this5.scheduleDiseaseStatusUpdate(lastUpdateTime);
          }, immunityDuration * 3600);
        };
        _proto.updateSickState = function updateSickState() {
          console.log("updateSickState start..., isSick = " + this.isSick);
          if (this.sickSprite) {
            this.sickSprite.node.active = this.isSick;
          }
        };
        _proto.setDeadState = function setDeadState() {
          console.log("setDeadState start ...");
          if (this.sprite && this.deadSpriteFrame) {
            this.sprite.spriteFrame = this.deadSpriteFrame;
          }
          this.isSick = false;
          this.updateSickState();
          this.growState = GrowState.NONE;
          this.stopGrowth();
          this.stopDiseaseStatusUpdates();
        };
        _proto.updateEntityState = function updateEntityState() {
          if (this.sceneItem) {
            if (this.sceneItem.state === SceneItemState.Dead) {
              this.setDeadState();
            } else {
              this.updateSickState();
            }
          }
        };
        _proto.onDestroy = function onDestroy() {
          this.stopDiseaseStatusUpdates();
          //this.stopGrowth();
          if (this.isPlayerOwner) {
            this.node.off(Node.EventType.TOUCH_END, this.harvest, this);
          }
        };
        _createClass(GrowthableEntity, [{
          key: "CareCount",
          get: function get() {
            return this.careCount;
          },
          set: function set(value) {
            if (this.careCount !== value) {
              this.careCount = value;
              this.stopGrowth();
              this.updateTotalGrowthTime();
              this.requestNextGrowth();
            }
          }
        }, {
          key: "TreatCount",
          get: function get() {
            return this.treatCount;
          },
          set: function set(value) {
            if (this.treatCount !== value) {
              this.treatCount = value;
              this.stopGrowth();
              this.updateTotalGrowthTime();
              this.requestNextGrowth();
            }
          }
        }, {
          key: "CleanseCount",
          get: function get() {
            return this.cleanseCount;
          },
          set: function set(value) {
            if (this.cleanseCount !== value) {
              this.cleanseCount = value;
              this.stopGrowth();
              this.updateTotalGrowthTime();
              this.requestNextGrowth();
            }
          }
        }, {
          key: "SourceInventoryItem",
          get: function get() {
            return this.sourceInventoryItem;
          }
        }, {
          key: "CooldownComponent",
          get: function get() {
            if (!this.cooldownComponent) {
              this.cooldownComponent = this.getComponent(CooldownComponent);
              if (!this.cooldownComponent) {
                this.cooldownComponent = this.addComponent(CooldownComponent);
              }
            }
            return this.cooldownComponent;
          }
        }, {
          key: "SceneItem",
          get: function get() {
            return this.sceneItem;
          }
        }]);
        return GrowthableEntity;
      }(SceneEntity), _class3.growthCompleteEvent = 'growthComplete', _class3), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "id", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return '';
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "description", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return '';
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "farmType", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return '';
        }
      }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "timeMin", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 0;
        }
      }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "growthTime", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 0;
        }
      }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "levelNeed", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 0;
        }
      }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "sprite", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "sickSprite", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "deadSpriteFrame", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor10 = _applyDecoratedDescriptor(_class2.prototype, "careCount", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 0;
        }
      }), _descriptor11 = _applyDecoratedDescriptor(_class2.prototype, "treatCount", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 0;
        }
      }), _descriptor12 = _applyDecoratedDescriptor(_class2.prototype, "cleanseCount", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 0;
        }
      })), _class2)) || _class));
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/HttpHelper.ts", ['cc'], function (exports) {
  var cclegacy;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
    }],
    execute: function () {
      cclegacy._RF.push({}, "76cd9p1xH1AWKTalRTajlQm", "HttpHelper", undefined);
      var HttpHelper = exports('HttpHelper', /*#__PURE__*/function () {
        function HttpHelper() {}
        /**
         * // GET 请求示例
        async function exampleGet() {
            try {
                const response = await HttpHelper.get('https://api.example.com/data', { id: '123' });
                console.log('GET Response:', response);
            } catch (error) {
                console.error('GET Error:', error);
            }
        }
        
        // POST 请求示例
        async function examplePost() {
            try {
                const response = await HttpHelper.post(
                    'https://api.example.com/data',
                    { name: 'John', age: 30 },
                    { 'Authorization': 'Bearer token123' }
                );
                console.log('POST Response:', response);
            } catch (error) {
                console.error('POST Error:', error);
            }
        }
         */
        HttpHelper.openLink = function openLink(url) {
          window.open(url, "_blank");
        }

        /**
         * 发送GET请求
         * @param url 请求URL
         * @param params 可选的查询参数
         * @returns Promise<string> 响应数据
         */;
        HttpHelper.get = function get(url, params) {
          if (params) {
            var queryString = this.objectToQueryString(params);
            url += (url.includes('?') ? '&' : '?') + queryString;
          }
          return this.request(url, 'GET');
        }

        /**
         * 发送POST请求
         * @param url 请求URL
         * @param data 可选的请求数据
         * @param headers 可选的请求头
         * @returns Promise<string> 响应数据
         */;
        HttpHelper.post = function post(url, data, headers) {
          return this.request(url, 'POST', data, headers);
        };
        HttpHelper.request = function request(url, method, data, headers) {
          return new Promise(function (resolve, reject) {
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function () {
              if (xhr.readyState === 4) {
                if (xhr.status >= 200 && xhr.status < 300) {
                  resolve(xhr.responseText);
                } else {
                  reject(new Error(xhr.statusText));
                }
              }
            };
            xhr.onerror = function () {
              return reject(new Error('Network error'));
            };
            xhr.ontimeout = function () {
              return reject(new Error('Request timeout'));
            };
            xhr.open(method, url, true);

            // 设置默认的 Content-Type
            xhr.setRequestHeader('Content-Type', 'application/json');

            // 设置自定义请求头
            if (headers) {
              Object.keys(headers).forEach(function (key) {
                return xhr.setRequestHeader(key, headers[key]);
              });
            }
            xhr.send(data ? JSON.stringify(data) : null);
          });
        };
        HttpHelper.objectToQueryString = function objectToQueryString(obj) {
          return Object.keys(obj).map(function (key) {
            return encodeURIComponent(key) + "=" + encodeURIComponent(obj[key]);
          }).join('&');
        };
        return HttpHelper;
      }());
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/InputComonent.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './SharedDefines.ts'], function (exports) {
  var _inheritsLoose, cclegacy, _decorator, Vec2, EventTarget, Node, Component, SharedDefines;
  return {
    setters: [function (module) {
      _inheritsLoose = module.inheritsLoose;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      Vec2 = module.Vec2;
      EventTarget = module.EventTarget;
      Node = module.Node;
      Component = module.Component;
    }, function (module) {
      SharedDefines = module.SharedDefines;
    }],
    execute: function () {
      var _dec, _class, _class2;
      cclegacy._RF.push({}, "5b7aazEDI5GY7j6xy24c5aX", "InputComonent", undefined);
      var ccclass = _decorator.ccclass,
        property = _decorator.property;
      var InputComponent = exports('InputComponent', (_dec = ccclass('InputComponent'), _dec(_class = (_class2 = /*#__PURE__*/function (_Component) {
        _inheritsLoose(InputComponent, _Component);
        function InputComponent() {
          var _this;
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          _this = _Component.call.apply(_Component, [this].concat(args)) || this;
          // 点击判定阈值，单位：秒
          _this.touchStartTime = 0;
          _this.touchStartPosition = new Vec2();
          _this.onTouchStart = null;
          _this.onTouchMove = null;
          _this.onTouchEnd = null;
          _this.onTouchCancel = null;
          _this.onClick = null;
          _this.eventTarget = new EventTarget();
          return _this;
        }
        var _proto = InputComponent.prototype;
        _proto.onLoad = function onLoad() {
          this.node.on(Node.EventType.TOUCH_START, this.touchStartHandler, this);
          this.node.on(Node.EventType.TOUCH_MOVE, this.touchMoveHandler, this);
          this.node.on(Node.EventType.TOUCH_END, this.touchEndHandler, this);
          this.node.on(Node.EventType.TOUCH_CANCEL, this.touchCancelHandler, this);
        };
        _proto.touchStartHandler = function touchStartHandler(event) {
          this.touchStartTime = Date.now();
          this.touchStartPosition = event.getLocation();
          if (this.onTouchStart) this.onTouchStart(event);
          this.eventTarget.emit(SharedDefines.EVENT_TOUCH_START, event);
        };
        _proto.touchMoveHandler = function touchMoveHandler(event) {
          if (this.onTouchMove) this.onTouchMove(event);
          this.eventTarget.emit(SharedDefines.EVENT_TOUCH_MOVE, event);
        };
        _proto.touchEndHandler = function touchEndHandler(event) {
          var touchEndTime = Date.now();
          var touchEndPosition = event.getLocation();
          if (this.onTouchEnd) this.onTouchEnd(event);
          this.eventTarget.emit(SharedDefines.EVENT_TOUCH_END, event);

          // 判断是否为点击事件
          var touchDuration = touchEndTime - this.touchStartTime;
          var touchDistance = Vec2.distance(this.touchStartPosition, touchEndPosition);
          if (touchDuration <= InputComponent.CLICK_THRESHOLD * 1000 && touchDistance < 10) {
            if (this.onClick) {
              this.onClick(event);
            }
            this.eventTarget.emit(SharedDefines.EVENT_CLICK, event);
          }
        };
        _proto.touchCancelHandler = function touchCancelHandler(event) {
          if (this.onTouchCancel) this.onTouchCancel(event);
          this.eventTarget.emit(SharedDefines.EVENT_TOUCH_CANCEL, event);
        };
        _proto.onDestroy = function onDestroy() {
          this.node.off(Node.EventType.TOUCH_START, this.touchStartHandler, this);
          this.node.off(Node.EventType.TOUCH_MOVE, this.touchMoveHandler, this);
          this.node.off(Node.EventType.TOUCH_END, this.touchEndHandler, this);
          this.node.off(Node.EventType.TOUCH_CANCEL, this.touchCancelHandler, this);
        };
        return InputComponent;
      }(Component), _class2.CLICK_THRESHOLD = 0.25, _class2)) || _class));
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/InventoryComponent.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './ItemDataManager.ts', './PlayerController.ts'], function (exports) {
  var _applyDecoratedDescriptor, _inheritsLoose, _createForOfIteratorHelperLoose, _extends, _createClass, _asyncToGenerator, _regeneratorRuntime, cclegacy, _decorator, EventTarget, Component, ItemDataManager, PlayerController;
  return {
    setters: [function (module) {
      _applyDecoratedDescriptor = module.applyDecoratedDescriptor;
      _inheritsLoose = module.inheritsLoose;
      _createForOfIteratorHelperLoose = module.createForOfIteratorHelperLoose;
      _extends = module.extends;
      _createClass = module.createClass;
      _asyncToGenerator = module.asyncToGenerator;
      _regeneratorRuntime = module.regeneratorRuntime;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      EventTarget = module.EventTarget;
      Component = module.Component;
    }, function (module) {
      ItemDataManager = module.ItemDataManager;
    }, function (module) {
      PlayerController = module.PlayerController;
    }],
    execute: function () {
      var _dec, _class2, _class3, _class4;
      cclegacy._RF.push({}, "7a91aGZd+lHCay7VRiJxdfF", "InventoryComponent", undefined);
      var ccclass = _decorator.ccclass,
        property = _decorator.property;
      var ItemType = exports('ItemType', /*#__PURE__*/function (ItemType) {
        ItemType[ItemType["NONE"] = 0] = "NONE";
        ItemType[ItemType["CROP"] = 1] = "CROP";
        ItemType[ItemType["CROPSEED"] = 2] = "CROPSEED";
        ItemType[ItemType["ANIMAL"] = 3] = "ANIMAL";
        ItemType[ItemType["ANIMALCUB"] = 4] = "ANIMALCUB";
        return ItemType;
      }({}));
      var InventoryItem = exports('InventoryItem',
      // constructor(id: string, name: string, description: string, itemType: string, expGain: number, buyPrice: number, sellPrice: number, iconName: string) {
      //     this.id = id;
      //     this.name = name;
      //     this.description = description;
      //     this.itemType = itemType;
      //     this.expGain = expGain;
      //     this.buyPrice = buyPrice;
      //     this.sellPrice = sellPrice;
      //     this.iconName = iconName;
      //     this.quantity = 1;
      // }
      function InventoryItem(jsonItemData, num) {
        if (num === void 0) {
          num = 1;
        }
        this.id = void 0;
        this.name = void 0;
        this.description = void 0;
        this.itemType = void 0;
        this.expGain = void 0;
        this.buyPrice = void 0;
        this.sellPrice = void 0;
        this.iconName = void 0;
        this.quantity = void 0;
        this.detailId = void 0;
        this.id = jsonItemData.id;
        this.name = jsonItemData.name;
        this.description = jsonItemData.description;
        this.itemType = jsonItemData.item_type;
        this.expGain = jsonItemData.exp_get;
        this.buyPrice = jsonItemData.buy_price;
        this.sellPrice = jsonItemData.sell_price === "" ? 0 : jsonItemData.sell_price;
        this.iconName = jsonItemData.png;
        this.quantity = num;
        this.detailId = jsonItemData.detail_id;
      });
      var InventoryComponent = exports('InventoryComponent', (_dec = ccclass('InventoryComponent'), _dec(_class2 = (_class3 = (_class4 = /*#__PURE__*/function (_Component) {
        _inheritsLoose(InventoryComponent, _Component);
        function InventoryComponent() {
          var _this;
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          _this = _Component.call.apply(_Component, [this].concat(args)) || this;
          _this.playerController = null;
          _this.items = new Map();
          _this.capacity = 100;
          // Default capacity
          _this.eventTarget = new EventTarget();
          return _this;
        }
        var _proto = InventoryComponent.prototype;
        _proto.onLoad = function onLoad() {
          this.playerController = this.node.getComponent(PlayerController);
        };
        _proto.initialize = function initialize(items) {
          this.items.clear();
          for (var _iterator = _createForOfIteratorHelperLoose(items), _step; !(_step = _iterator()).done;) {
            var item = _step.value;
            var itemData = ItemDataManager.instance.getItemById(item.item_id);
            var inventoryItem = new InventoryItem(itemData, item.num);
            this.items.set(inventoryItem.id, _extends({}, inventoryItem));
          }
        };
        _proto.setCapacity = function setCapacity(newCapacity) {
          this.capacity = newCapacity;
        };
        _proto.addItem = /*#__PURE__*/function () {
          var _addItem = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(item) {
            var existingItem;
            return _regeneratorRuntime().wrap(function _callee$(_context) {
              while (1) switch (_context.prev = _context.next) {
                case 0:
                  // if (this.isFull && !this.items.has(item.id)) {
                  //     console.warn('Inventory is full. Cannot add new item.');
                  //     return false;
                  // }
                  existingItem = this.items.get(item.id);
                  if (existingItem) {
                    existingItem.quantity += item.quantity;
                    this.eventTarget.emit(InventoryComponent.EVENT_ITEM_UPDATED, existingItem);
                  } else {
                    this.items.set(item.id, _extends({}, item));
                    this.eventTarget.emit(InventoryComponent.EVENT_ITEM_ADDED, item);
                  }
                  console.log("Added " + item.quantity + " of item with id: " + item.id);
                  return _context.abrupt("return", true);
                case 4:
                case "end":
                  return _context.stop();
              }
            }, _callee, this);
          }));
          function addItem(_x) {
            return _addItem.apply(this, arguments);
          }
          return addItem;
        }();
        _proto.removeItem = /*#__PURE__*/function () {
          var _removeItem = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2(itemId, quantity) {
            var item;
            return _regeneratorRuntime().wrap(function _callee2$(_context2) {
              while (1) switch (_context2.prev = _context2.next) {
                case 0:
                  if (quantity === void 0) {
                    quantity = 1;
                  }
                  item = this.items.get(itemId);
                  if (item) {
                    _context2.next = 5;
                    break;
                  }
                  console.warn("Item with id " + itemId + " not found in inventory.");
                  return _context2.abrupt("return", false);
                case 5:
                  if (!(item.quantity < quantity)) {
                    _context2.next = 8;
                    break;
                  }
                  console.warn("Not enough quantity to remove. Requested: " + quantity + ", Available: " + item.quantity);
                  return _context2.abrupt("return", false);
                case 8:
                  item.quantity -= quantity;
                  this.eventTarget.emit(InventoryComponent.EVENT_ITEM_UPDATED, item);
                  if (item.quantity === 0) {
                    this.items["delete"](itemId);
                    this.eventTarget.emit(InventoryComponent.EVENT_ITEM_REMOVED, itemId);
                  }
                  return _context2.abrupt("return", true);
                case 12:
                case "end":
                  return _context2.stop();
              }
            }, _callee2, this);
          }));
          function removeItem(_x2, _x3) {
            return _removeItem.apply(this, arguments);
          }
          return removeItem;
        }();
        _proto.getItem = function getItem(itemId) {
          return this.items.get(itemId);
        };
        _proto.getItemsByType = function getItemsByType(itemType) {
          return Array.from(this.items.values()).filter(function (item) {
            return item.itemType === itemType;
          });
        };
        _proto.getAllItems = function getAllItems() {
          return Array.from(this.items.values());
        };
        _proto.clear = function clear() {
          this.items.clear();
        };
        _proto.hasItem = function hasItem(itemId) {
          return this.items.has(itemId);
        };
        _proto.getItemQuantity = function getItemQuantity(itemId) {
          var item = this.items.get(itemId);
          return item ? item.quantity : 0;
        };
        _createClass(InventoryComponent, [{
          key: "itemCount",
          get: function get() {
            return this.items.size;
          }
        }, {
          key: "isFull",
          get: function get() {
            return this.itemCount >= this.capacity;
          }
        }]);
        return InventoryComponent;
      }(Component), _class4.EVENT_ITEM_ADDED = 'item-added', _class4.EVENT_ITEM_REMOVED = 'item-removed', _class4.EVENT_ITEM_UPDATED = 'item-updated', _class4), (_applyDecoratedDescriptor(_class3.prototype, "itemCount", [property], Object.getOwnPropertyDescriptor(_class3.prototype, "itemCount"), _class3.prototype), _applyDecoratedDescriptor(_class3.prototype, "isFull", [property], Object.getOwnPropertyDescriptor(_class3.prototype, "isFull"), _class3.prototype)), _class3)) || _class2));
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/ItemDataManager.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './SharedDefines.ts'], function (exports) {
  var _createClass, _asyncToGenerator, _regeneratorRuntime, cclegacy, resources, JsonAsset, SharedDefines;
  return {
    setters: [function (module) {
      _createClass = module.createClass;
      _asyncToGenerator = module.asyncToGenerator;
      _regeneratorRuntime = module.regeneratorRuntime;
    }, function (module) {
      cclegacy = module.cclegacy;
      resources = module.resources;
      JsonAsset = module.JsonAsset;
    }, function (module) {
      SharedDefines = module.SharedDefines;
    }],
    execute: function () {
      cclegacy._RF.push({}, "9d19cFSh79OUpDLPUTZHAwZ", "ItemDataManager", undefined);
      var ItemDataManager = exports('ItemDataManager', /*#__PURE__*/function () {
        function ItemDataManager() {
          this.itemDataList = [];
        }
        var _proto = ItemDataManager.prototype;
        _proto.loadItemData = /*#__PURE__*/function () {
          var _loadItemData = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee() {
            var _this = this;
            return _regeneratorRuntime().wrap(function _callee$(_context) {
              while (1) switch (_context.prev = _context.next) {
                case 0:
                  return _context.abrupt("return", new Promise(function (resolve, reject) {
                    resources.load(SharedDefines.JSON_ITEM_DATA, JsonAsset, function (err, jsonAsset) {
                      if (err) {
                        console.error('Failed to load ItemData:', err);
                        reject(err);
                        return;
                      }
                      _this.itemDataList = jsonAsset.json.list;
                      resolve();
                    });
                  }));
                case 1:
                case "end":
                  return _context.stop();
              }
            }, _callee);
          }));
          function loadItemData() {
            return _loadItemData.apply(this, arguments);
          }
          return loadItemData;
        }();
        _proto.getItemById = function getItemById(id) {
          return this.itemDataList.find(function (item) {
            return item.id === id;
          });
        };
        _proto.getItemByName = function getItemByName(name) {
          return this.itemDataList.find(function (item) {
            return item.name === name;
          });
        };
        _proto.getItemsByType = function getItemsByType(itemType) {
          return this.itemDataList.filter(function (item) {
            return item.item_type === itemType;
          });
        };
        _proto.getItemsBySellPrice = function getItemsBySellPrice(minPrice, maxPrice) {
          return this.itemDataList.filter(function (item) {
            var sellPrice = parseInt(item.sell_price);
            return sellPrice >= minPrice && sellPrice <= maxPrice;
          });
        };
        _proto.getItemsByExpGain = function getItemsByExpGain(minExp, maxExp) {
          return this.itemDataList.filter(function (item) {
            var expGain = parseInt(item.exp_get);
            return expGain >= minExp && expGain <= maxExp;
          });
        };
        _proto.getAllItems = function getAllItems() {
          return [].concat(this.itemDataList);
        };
        _proto.getItemCount = function getItemCount() {
          return this.itemDataList.length;
        };
        _proto.isItemDataLoaded = function isItemDataLoaded() {
          return this.itemDataList.length > 0;
        };
        _createClass(ItemDataManager, null, [{
          key: "instance",
          get: function get() {
            if (this._instance === null) {
              this._instance = new ItemDataManager();
            }
            return this._instance;
          }
        }]);
        return ItemDataManager;
      }());
      ItemDataManager._instance = null;
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/LayoutAdapter.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc'], function (exports) {
  var _applyDecoratedDescriptor, _inheritsLoose, _initializerDefineProperty, _assertThisInitialized, _createForOfIteratorHelperLoose, _createClass, cclegacy, _decorator, Layout, Vec3, UITransform, Widget, Node, Component;
  return {
    setters: [function (module) {
      _applyDecoratedDescriptor = module.applyDecoratedDescriptor;
      _inheritsLoose = module.inheritsLoose;
      _initializerDefineProperty = module.initializerDefineProperty;
      _assertThisInitialized = module.assertThisInitialized;
      _createForOfIteratorHelperLoose = module.createForOfIteratorHelperLoose;
      _createClass = module.createClass;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      Layout = module.Layout;
      Vec3 = module.Vec3;
      UITransform = module.UITransform;
      Widget = module.Widget;
      Node = module.Node;
      Component = module.Component;
    }],
    execute: function () {
      var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5;
      cclegacy._RF.push({}, "16d0a7/LSBLNadwM1EPsT78", "LayoutAdapter", undefined);
      var ccclass = _decorator.ccclass,
        property = _decorator.property;
      var LayoutAdapter = exports('LayoutAdapter', (_dec = ccclass('LayoutAdapter'), _dec2 = property(Number), _dec3 = property(Number), _dec4 = property(Boolean), _dec5 = property(Boolean), _dec6 = property(Layout), _dec(_class = (_class2 = /*#__PURE__*/function (_Component) {
        _inheritsLoose(LayoutAdapter, _Component);
        function LayoutAdapter() {
          var _this;
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          _this = _Component.call.apply(_Component, [this].concat(args)) || this;
          _initializerDefineProperty(_this, "designWidth", _descriptor, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "designHeight", _descriptor2, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "adapterWidth", _descriptor3, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "adapterHeight", _descriptor4, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "_layout", _descriptor5, _assertThisInitialized(_this));
          //define padding and spacing
          _this.paddingLeft = 0;
          _this.paddingRight = 0;
          _this.paddingTop = 0;
          _this.paddingBottom = 0;
          _this.spacingX = 0;
          _this.spacingY = 0;
          _this.originalContentSize = new Vec3();
          _this.currentContentSize = new Vec3();
          _this.realScale = new Vec3();
          return _this;
        }
        var _proto = LayoutAdapter.prototype;
        _proto.onLoad = function onLoad() {
          var _this2 = this;
          var uiTransform = this.node.getComponent(UITransform);
          if (uiTransform) {
            // this.originalContentSize.set(uiTransform.width, uiTransform.height, 0);
            // this.currentContentSize.set(uiTransform.width, uiTransform.height, 0);
            this.originalContentSize.set(this.designWidth, this.designHeight, 0);
            this.currentContentSize.set(this.designWidth, uiTransform.height, 0);
          }
          this.paddingLeft = this.layout.paddingLeft;
          this.paddingRight = this.layout.paddingRight;
          this.paddingTop = this.layout.paddingTop;
          this.paddingBottom = this.layout.paddingBottom;
          this.spacingX = this.layout.spacingX;
          this.spacingY = this.layout.spacingY;
          this.updateRealScale();
          var widget = this.node.getComponent(Widget);
          if (widget) {
            widget.node.on(Node.EventType.SIZE_CHANGED, function () {
              _this2.onSizeChanged();
            });
          }
        };
        _proto.onSizeChanged = function onSizeChanged() {
          var uiTransform = this.node.getComponent(UITransform);
          if (uiTransform) {
            this.currentContentSize.set(uiTransform.width, uiTransform.height, 0);
          }
          this.updateRealScale();
        };
        _proto.updateRealScale = function updateRealScale() {
          console.log("updateRealScale start .. name = " + this.node.name + ", originalContentSize: " + this.currentContentSize);
          var screenSize = this.currentContentSize;
          var designSize = this.originalContentSize;
          var scaleX = this.adapterWidth ? Math.floor(screenSize.x / designSize.x * 100) / 100 : 1;
          var scaleY = this.adapterHeight ? Math.floor(screenSize.y / designSize.y * 100) / 100 : 1;
          this.realScale.set(scaleX, scaleY, 1);
          //log realScale
          console.log("realScale: " + this.realScale);
          this.updateLayoutPaddingAndSpacing();
          this.updateLayoutChildrenScale();
          this.layout.updateLayout();
        };
        _proto.updateLayoutPaddingAndSpacing = function updateLayoutPaddingAndSpacing() {
          //to floor the padding and spacing
          this.layout.paddingLeft = Math.floor(this.paddingLeft * this.realScale.x);
          this.layout.paddingRight = Math.floor(this.paddingRight * this.realScale.x);
          this.layout.paddingTop = Math.floor(this.paddingTop * this.realScale.y);
          this.layout.paddingBottom = Math.floor(this.paddingBottom * this.realScale.y);
          this.layout.spacingX = Math.floor(this.spacingX * this.realScale.x);
          this.layout.spacingY = Math.floor(this.spacingY * this.realScale.y);
          //log layout padding and spacing
          console.log("layout padding: " + this.layout.paddingLeft + ", " + this.layout.paddingRight + ", " + this.layout.paddingTop + ", " + this.layout.paddingBottom);
          console.log("layout spacing: " + this.layout.spacingX + ", " + this.layout.spacingY);
        };
        _proto.updateLayoutChildrenScale = function updateLayoutChildrenScale() {
          var children = this.node.children;
          for (var _iterator = _createForOfIteratorHelperLoose(children), _step; !(_step = _iterator()).done;) {
            var child = _step.value;
            var childTransform = child.getComponent(UITransform);
            if (childTransform) {
              childTransform.node.setScale(this.realScale.x, this.realScale.y, this.realScale.z);
            }
          }
        };
        _createClass(LayoutAdapter, [{
          key: "layout",
          get: function get() {
            if (!this._layout) {
              this._layout = this.node.getComponent(Layout);
            }
            return this._layout;
          }
        }, {
          key: "RealScale",
          get: function get() {
            return this.realScale;
          }
        }]);
        return LayoutAdapter;
      }(Component), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "designWidth", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 1920;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "designHeight", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 1080;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "adapterWidth", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return true;
        }
      }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "adapterHeight", [_dec5], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return false;
        }
      }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "_layout", [_dec6], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      })), _class2)) || _class));
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/main", ['./debug-view-runtime-control.ts', './GameEntry.ts', './BuildingPlacementComponent.ts', './CooldownComponent.ts', './DragDropComponent.ts', './InputComonent.ts', './InventoryComponent.ts', './GameController.ts', './PlayerController.ts', './CoinCollectionEffectComponent.ts', './Animal.ts', './Building.ts', './Crop.ts', './Fence.ts', './GrowthableEntity.ts', './PlayerState.ts', './PlotTile.ts', './SceneEntity.ts', './DateHelper.ts', './HttpHelper.ts', './SpriteHelper.ts', './UIEffectHelper.ts', './UIHelper.ts', './AnimalDataManager.ts', './BuildDataManager.ts', './BuildingManager.ts', './CropDataManager.ts', './DashFunManager.ts', './GradeDataManager.ts', './ItemDataManager.ts', './NetworkManager.ts', './ResourceManager.ts', './ScreenOrientationManager.ts', './SyntheDataManager.ts', './SharedDefines.ts', './NetworkPlayerState.ts', './UIAdaptComponent.ts', './WindowManager.ts', './WindowBase.ts', './CoinDisplay.ts', './CurrencyDisplayBase.ts', './DiamondDisplay.ts', './LayoutAdapter.ts', './CraftScrollViewItem.ts', './ScrollViewItem.ts', './CraftWindow.ts', './FarmFactoryWindow.ts', './FarmSelectionWindow.ts', './GameWindow.ts', './MainWindow.ts', './ShopWindow.ts', './TipsWindow.ts', './ToastWindow.ts'], function () {
  return {
    setters: [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
    execute: function () {}
  };
});

System.register("chunks:///_virtual/MainWindow.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './WindowBase.ts', './WindowManager.ts', './NetworkManager.ts', './DashFunManager.ts'], function (exports) {
  var _applyDecoratedDescriptor, _inheritsLoose, _initializerDefineProperty, _assertThisInitialized, _asyncToGenerator, _regeneratorRuntime, cclegacy, _decorator, EditBox, Button, WindowBase, WindowManager, NetworkManager, DashFunManager;
  return {
    setters: [function (module) {
      _applyDecoratedDescriptor = module.applyDecoratedDescriptor;
      _inheritsLoose = module.inheritsLoose;
      _initializerDefineProperty = module.initializerDefineProperty;
      _assertThisInitialized = module.assertThisInitialized;
      _asyncToGenerator = module.asyncToGenerator;
      _regeneratorRuntime = module.regeneratorRuntime;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      EditBox = module.EditBox;
      Button = module.Button;
    }, function (module) {
      WindowBase = module.WindowBase;
    }, function (module) {
      WindowManager = module.WindowManager;
    }, function (module) {
      NetworkManager = module.NetworkManager;
    }, function (module) {
      DashFunManager = module.DashFunManager;
    }],
    execute: function () {
      var _dec, _dec2, _dec3, _dec4, _class, _class2, _descriptor, _descriptor2, _descriptor3;
      cclegacy._RF.push({}, "ef3c6iVecZJZ52hhIp8pRIh", "MainWindow", undefined);
      var ccclass = _decorator.ccclass,
        property = _decorator.property;
      var MainWindow = exports('MainWindow', (_dec = ccclass('MainWindow'), _dec2 = property(EditBox), _dec3 = property(EditBox), _dec4 = property(Button), _dec(_class = (_class2 = /*#__PURE__*/function (_WindowBase) {
        _inheritsLoose(MainWindow, _WindowBase);
        function MainWindow() {
          var _this;
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          _this = _WindowBase.call.apply(_WindowBase, [this].concat(args)) || this;
          _initializerDefineProperty(_this, "ebUserId", _descriptor, _assertThisInitialized(_this));
          //password
          _initializerDefineProperty(_this, "ebPassword", _descriptor2, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "btnStart", _descriptor3, _assertThisInitialized(_this));
          return _this;
        }
        var _proto = MainWindow.prototype;
        _proto.initialize = function initialize() {
          _WindowBase.prototype.initialize.call(this);
          this.setupEventListeners();
          globalThis.mainWindow = this;
          DashFunManager.instance.updateLoadingProgress(10);
          DashFunManager.instance.eventTarget.on(DashFunManager.EVENT_GET_USER_PROFILE_RESULT, this.onGetUserProfileResult, this);
          console.log('MainWindow initialized');
        };
        _proto.show = function show() {
          var _WindowBase$prototype;
          for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            args[_key2] = arguments[_key2];
          }
          (_WindowBase$prototype = _WindowBase.prototype.show).call.apply(_WindowBase$prototype, [this].concat(args));
          console.log('MainWindow shown');
          DashFunManager.instance.getUserProfile();
        };
        _proto.hide = function hide() {
          _WindowBase.prototype.hide.call(this);
          console.log('MainWindow hidden');
        };
        _proto.setupEventListeners = function setupEventListeners() {
          if (this.btnStart) {
            this.btnStart.node.on(Button.EventType.CLICK, this.onStartButtonClicked, this);
          } else {
            console.warn('Start button not found in MainWindow');
          }
        };
        _proto.onGetUserProfileResult = /*#__PURE__*/function () {
          var _onGetUserProfileResult = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(data) {
            var userProfile, result;
            return _regeneratorRuntime().wrap(function _callee$(_context) {
              while (1) switch (_context.prev = _context.next) {
                case 0:
                  console.log("onGetUserProfileResult", data);
                  DashFunManager.instance.updateLoadingProgress(100);
                  userProfile = data;
                  _context.next = 5;
                  return this.gameController.login(userProfile.id, "");
                case 5:
                  result = _context.sent;
                  if (!(result && result.success)) {
                    _context.next = 15;
                    break;
                  }
                  if (!(userProfile.avatarUrl && this.gameController.getPlayerController().playerState.headUrl != userProfile.avatarUrl)) {
                    _context.next = 11;
                    break;
                  }
                  console.log("update avatar url: " + userProfile.avatarUrl);
                  _context.next = 11;
                  return NetworkManager.instance.requestUpdateAvatarUrl(userProfile.avatarUrl);
                case 11:
                  // Add your start game logic here
                  WindowManager.instance.show("GameWindow");
                  this.hide();
                  _context.next = 17;
                  break;
                case 15:
                  console.log(result.message);
                  WindowManager.instance.show("ToastWindow", result.message);
                case 17:
                case "end":
                  return _context.stop();
              }
            }, _callee, this);
          }));
          function onGetUserProfileResult(_x) {
            return _onGetUserProfileResult.apply(this, arguments);
          }
          return onGetUserProfileResult;
        }();
        _proto.onStartButtonClicked = /*#__PURE__*/function () {
          var _onStartButtonClicked = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2() {
            var result;
            return _regeneratorRuntime().wrap(function _callee2$(_context2) {
              while (1) switch (_context2.prev = _context2.next) {
                case 0:
                  console.log("onStartButtonClicked start...");
                  _context2.next = 3;
                  return this.gameController.login(this.ebUserId.string, this.ebPassword.string);
                case 3:
                  result = _context2.sent;
                  if (result && result.success) {
                    // Add your start game logic here
                    WindowManager.instance.show("GameWindow");
                    this.hide();
                  } else {
                    console.log(result.message);
                    WindowManager.instance.show("ToastWindow", result.message);
                  }
                case 5:
                case "end":
                  return _context2.stop();
              }
            }, _callee2, this);
          }));
          function onStartButtonClicked() {
            return _onStartButtonClicked.apply(this, arguments);
          }
          return onStartButtonClicked;
        }();
        _proto.onDestroy = function onDestroy() {
          _WindowBase.prototype.onDestroy.call(this);
          if (this.btnStart) {
            this.btnStart.node.off(Button.EventType.CLICK, this.onStartButtonClicked, this);
          }
        };
        return MainWindow;
      }(WindowBase), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "ebUserId", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "ebPassword", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "btnStart", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      })), _class2)) || _class));
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/NetworkManager.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './HttpHelper.ts'], function (exports) {
  var _applyDecoratedDescriptor, _inheritsLoose, _initializerDefineProperty, _assertThisInitialized, _createClass, _asyncToGenerator, _regeneratorRuntime, _extends, cclegacy, _decorator, EventTarget, Component, HttpHelper;
  return {
    setters: [function (module) {
      _applyDecoratedDescriptor = module.applyDecoratedDescriptor;
      _inheritsLoose = module.inheritsLoose;
      _initializerDefineProperty = module.initializerDefineProperty;
      _assertThisInitialized = module.assertThisInitialized;
      _createClass = module.createClass;
      _asyncToGenerator = module.asyncToGenerator;
      _regeneratorRuntime = module.regeneratorRuntime;
      _extends = module.extends;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      EventTarget = module.EventTarget;
      Component = module.Component;
    }, function (module) {
      HttpHelper = module.HttpHelper;
    }],
    execute: function () {
      var _dec, _dec2, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _class3;
      cclegacy._RF.push({}, "c1c62QuDqxLY7YzBg+GDyvN", "NetworkManager", undefined);
      var ccclass = _decorator.ccclass,
        property = _decorator.property;
      var NetworkManager = exports('NetworkManager', (_dec = ccclass('NetworkManager'), _dec2 = property({
        multiline: true,
        tooltip: 'Enter default headers in JSON format'
      }), _dec(_class = (_class2 = (_class3 = /*#__PURE__*/function (_Component) {
        _inheritsLoose(NetworkManager, _Component);
        function NetworkManager() {
          var _this;
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          _this = _Component.call.apply(_Component, [this].concat(args)) || this;
          _initializerDefineProperty(_this, "localBaseUrl", _descriptor, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "serverBaseUrl", _descriptor2, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "loginPort", _descriptor3, _assertThisInitialized(_this));
          // 登录服务器端口
          _initializerDefineProperty(_this, "gameServerPort", _descriptor4, _assertThisInitialized(_this));
          // 游戏服务器端口
          _initializerDefineProperty(_this, "paymentPort", _descriptor5, _assertThisInitialized(_this));
          // 支付服务器端口
          _initializerDefineProperty(_this, "maxLoginRetries", _descriptor6, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "defaultHeadersJson", _descriptor7, _assertThisInitialized(_this));
          _this.token = '';
          _this.userId = '';
          _initializerDefineProperty(_this, "simulateNetwork", _descriptor8, _assertThisInitialized(_this));
          _this.eventTarget = new EventTarget();
          return _this;
        }
        var _proto = NetworkManager.prototype;
        _proto.onLoad = function onLoad() {
          if (NetworkManager._instance !== null) {
            this.node.destroy();
            return;
          }
          NetworkManager._instance = this;
        };
        _proto.buildApiUrl = function buildApiUrl(api, port) {
          var url = this.baseUrl;
          return "" + url + api;
        };
        _proto.login = /*#__PURE__*/function () {
          var _login = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(userId, password) {
            var loginUrl, data, attempt, response, result;
            return _regeneratorRuntime().wrap(function _callee$(_context) {
              while (1) switch (_context.prev = _context.next) {
                case 0:
                  loginUrl = this.buildApiUrl(NetworkManager.API_LOGIN, this.loginPort);
                  data = {
                    userid: userId,
                    password: password
                  };
                  attempt = 1;
                case 3:
                  if (!(attempt <= this.maxLoginRetries)) {
                    _context.next = 39;
                    break;
                  }
                  _context.prev = 4;
                  console.log(loginUrl);
                  _context.next = 8;
                  return HttpHelper.post(loginUrl, data, this.defaultHeaders);
                case 8:
                  response = _context.sent;
                  result = JSON.parse(response);
                  if (!result.success) {
                    _context.next = 18;
                    break;
                  }
                  console.log('Login successful', result);
                  this.token = result.sessionToken;
                  this.userId = result.user.id;
                  this.eventTarget.emit(NetworkManager.EVENT_LOGIN_SUCCESS, result.user, result.sessionToken);
                  return _context.abrupt("return", result);
                case 18:
                  console.warn("Login attempt " + attempt + " failed: " + result.message);
                  if (!(attempt === this.maxLoginRetries)) {
                    _context.next = 23;
                    break;
                  }
                  console.error('Max login attempts reached');
                  this.eventTarget.emit(NetworkManager.EVENT_LOGIN_FAILED, 'Max login attempts reached');
                  return _context.abrupt("return", result);
                case 23:
                  _context.next = 25;
                  return this.delay(1000 * attempt);
                case 25:
                  _context.next = 36;
                  break;
                case 27:
                  _context.prev = 27;
                  _context.t0 = _context["catch"](4);
                  console.error("Login attempt " + attempt + " error:", _context.t0);
                  if (!(attempt === this.maxLoginRetries)) {
                    _context.next = 34;
                    break;
                  }
                  this.handleError(_context.t0);
                  this.eventTarget.emit(NetworkManager.EVENT_LOGIN_FAILED, _context.t0);
                  return _context.abrupt("return", null);
                case 34:
                  _context.next = 36;
                  return this.delay(1000 * attempt);
                case 36:
                  attempt++;
                  _context.next = 3;
                  break;
                case 39:
                case "end":
                  return _context.stop();
              }
            }, _callee, this, [[4, 27]]);
          }));
          function login(_x, _x2) {
            return _login.apply(this, arguments);
          }
          return login;
        }();
        _proto.requestSceneItemsByUserId = /*#__PURE__*/function () {
          var _requestSceneItemsByUserId = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2(userId) {
            var url, headers, data, response, result;
            return _regeneratorRuntime().wrap(function _callee2$(_context2) {
              while (1) switch (_context2.prev = _context2.next) {
                case 0:
                  url = this.buildApiUrl(NetworkManager.API_GET_USER_SCENE_ITEMS, this.gameServerPort);
                  console.log(url);
                  headers = {
                    'Authorization': this.token
                  };
                  data = {
                    userid: userId
                  };
                  _context2.prev = 4;
                  _context2.next = 7;
                  return HttpHelper.post(url, data, headers);
                case 7:
                  response = _context2.sent;
                  console.log(response);
                  result = JSON.parse(response);
                  this.eventTarget.emit(NetworkManager.EVENT_GET_USER_SCENE_ITEMS, result);
                  _context2.next = 16;
                  break;
                case 13:
                  _context2.prev = 13;
                  _context2.t0 = _context2["catch"](4);
                  this.handleError(_context2.t0);
                case 16:
                case "end":
                  return _context2.stop();
              }
            }, _callee2, this, [[4, 13]]);
          }));
          function requestSceneItemsByUserId(_x3) {
            return _requestSceneItemsByUserId.apply(this, arguments);
          }
          return requestSceneItemsByUserId;
        }() //implement requestUpdateAvatarUrl
        ;

        _proto.requestUpdateAvatarUrl = /*#__PURE__*/
        function () {
          var _requestUpdateAvatarUrl = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee3(avatarUrl) {
            var url, headers, data, response, result;
            return _regeneratorRuntime().wrap(function _callee3$(_context3) {
              while (1) switch (_context3.prev = _context3.next) {
                case 0:
                  url = this.buildApiUrl(NetworkManager.API_UPDATE_AVATAR_URL, this.gameServerPort);
                  headers = _extends({
                    'Authorization': this.token
                  }, this.defaultHeaders);
                  data = {
                    userid: this.userId,
                    avatarUrl: avatarUrl
                  };
                  _context3.prev = 3;
                  _context3.next = 6;
                  return HttpHelper.post(url, data, headers);
                case 6:
                  response = _context3.sent;
                  result = JSON.parse(response);
                  return _context3.abrupt("return", result.success);
                case 11:
                  _context3.prev = 11;
                  _context3.t0 = _context3["catch"](3);
                  this.handleError(_context3.t0);
                  return _context3.abrupt("return", false);
                case 15:
                case "end":
                  return _context3.stop();
              }
            }, _callee3, this, [[3, 11]]);
          }));
          function requestUpdateAvatarUrl(_x4) {
            return _requestUpdateAvatarUrl.apply(this, arguments);
          }
          return requestUpdateAvatarUrl;
        }();
        _proto.getLatestCommandDuration = /*#__PURE__*/function () {
          var _getLatestCommandDuration = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee4(sceneItemId, userid) {
            var url, headers, data, response;
            return _regeneratorRuntime().wrap(function _callee4$(_context4) {
              while (1) switch (_context4.prev = _context4.next) {
                case 0:
                  if (userid === void 0) {
                    userid = null;
                  }
                  if (!this.simulateNetwork) {
                    _context4.next = 3;
                    break;
                  }
                  return _context4.abrupt("return", {
                    success: true,
                    duration: 0
                  });
                case 3:
                  url = this.buildApiUrl(NetworkManager.API_GET_LATEST_COMMAND_DURATION, this.gameServerPort);
                  headers = _extends({
                    'Authorization': this.token
                  }, this.defaultHeaders);
                  data = {
                    userid: userid || this.userId,
                    sceneItemId: sceneItemId
                  };
                  _context4.prev = 6;
                  _context4.next = 9;
                  return HttpHelper.post(url, data, headers);
                case 9:
                  response = _context4.sent;
                  return _context4.abrupt("return", JSON.parse(response));
                case 13:
                  _context4.prev = 13;
                  _context4.t0 = _context4["catch"](6);
                  this.handleError(_context4.t0);
                  throw _context4.t0;
                case 17:
                case "end":
                  return _context4.stop();
              }
            }, _callee4, this, [[6, 13]]);
          }));
          function getLatestCommandDuration(_x5, _x6) {
            return _getLatestCommandDuration.apply(this, arguments);
          }
          return getLatestCommandDuration;
        }();
        _proto.plant = /*#__PURE__*/function () {
          var _plant = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee5(itemId, sceneType, x, y, parent_node_name) {
            var url, headers, data, response, result;
            return _regeneratorRuntime().wrap(function _callee5$(_context5) {
              while (1) switch (_context5.prev = _context5.next) {
                case 0:
                  if (!this.simulateNetwork) {
                    _context5.next = 3;
                    break;
                  }
                  this.eventTarget.emit(NetworkManager.EVENT_PLANT, {
                    success: true
                  });
                  return _context5.abrupt("return", true);
                case 3:
                  url = this.buildApiUrl(NetworkManager.API_PLANT, this.gameServerPort);
                  headers = _extends({
                    'Authorization': this.token
                  }, this.defaultHeaders);
                  data = {
                    userid: this.userId,
                    itemid: itemId,
                    type: sceneType,
                    x: x,
                    y: y,
                    parent_node_name: parent_node_name
                  };
                  _context5.prev = 6;
                  _context5.next = 9;
                  return HttpHelper.post(url, data, headers);
                case 9:
                  response = _context5.sent;
                  result = JSON.parse(response);
                  this.eventTarget.emit(NetworkManager.EVENT_PLANT, result);
                  return _context5.abrupt("return", result.success);
                case 15:
                  _context5.prev = 15;
                  _context5.t0 = _context5["catch"](6);
                  this.handleError(_context5.t0);
                  return _context5.abrupt("return", false);
                case 19:
                case "end":
                  return _context5.stop();
              }
            }, _callee5, this, [[6, 15]]);
          }));
          function plant(_x7, _x8, _x9, _x10, _x11) {
            return _plant.apply(this, arguments);
          }
          return plant;
        }();
        _proto.harvest = /*#__PURE__*/function () {
          var _harvest = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee6(sceneId, itemId, itemType) {
            var url, headers, data, response, result;
            return _regeneratorRuntime().wrap(function _callee6$(_context6) {
              while (1) switch (_context6.prev = _context6.next) {
                case 0:
                  if (!this.simulateNetwork) {
                    _context6.next = 3;
                    break;
                  }
                  this.eventTarget.emit(NetworkManager.EVENT_HARVEST, {
                    success: true
                  });
                  return _context6.abrupt("return", true);
                case 3:
                  url = this.buildApiUrl(NetworkManager.API_HARVEST, this.gameServerPort);
                  headers = _extends({
                    'Authorization': this.token
                  }, this.defaultHeaders);
                  data = {
                    userid: this.userId,
                    sceneid: sceneId,
                    itemid: itemId,
                    itemtype: itemType
                  };
                  _context6.prev = 6;
                  _context6.next = 9;
                  return HttpHelper.post(url, data, headers);
                case 9:
                  response = _context6.sent;
                  result = JSON.parse(response);
                  this.eventTarget.emit(NetworkManager.EVENT_HARVEST, result);
                  return _context6.abrupt("return", result.success);
                case 15:
                  _context6.prev = 15;
                  _context6.t0 = _context6["catch"](6);
                  this.handleError(_context6.t0);
                  return _context6.abrupt("return", false);
                case 19:
                case "end":
                  return _context6.stop();
              }
            }, _callee6, this, [[6, 15]]);
          }));
          function harvest(_x12, _x13, _x14) {
            return _harvest.apply(this, arguments);
          }
          return harvest;
        }();
        _proto.addInventoryItem = /*#__PURE__*/function () {
          var _addInventoryItem = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee7(token, userId, itemId, type, delta) {
            var url, headers, data, response, result;
            return _regeneratorRuntime().wrap(function _callee7$(_context7) {
              while (1) switch (_context7.prev = _context7.next) {
                case 0:
                  if (!this.simulateNetwork) {
                    _context7.next = 2;
                    break;
                  }
                  return _context7.abrupt("return", true);
                case 2:
                  url = this.buildApiUrl(NetworkManager.API_ADD_INVENTORY_ITEM, this.gameServerPort);
                  headers = _extends({
                    'Authorization': token
                  }, this.defaultHeaders);
                  data = {
                    userId: userId,
                    itemId: itemId,
                    type: type,
                    quantity: delta
                  };
                  _context7.prev = 5;
                  _context7.next = 8;
                  return HttpHelper.post(url, data, headers);
                case 8:
                  response = _context7.sent;
                  result = JSON.parse(response);
                  return _context7.abrupt("return", result.success);
                case 13:
                  _context7.prev = 13;
                  _context7.t0 = _context7["catch"](5);
                  this.handleError(_context7.t0);
                  return _context7.abrupt("return", false);
                case 17:
                case "end":
                  return _context7.stop();
              }
            }, _callee7, this, [[5, 13]]);
          }));
          function addInventoryItem(_x15, _x16, _x17, _x18, _x19) {
            return _addInventoryItem.apply(this, arguments);
          }
          return addInventoryItem;
        }();
        _proto.removeInventoryItem = /*#__PURE__*/function () {
          var _removeInventoryItem = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee8(token, userId, itemId, type, delta) {
            var url, headers, data, response, result;
            return _regeneratorRuntime().wrap(function _callee8$(_context8) {
              while (1) switch (_context8.prev = _context8.next) {
                case 0:
                  if (!this.simulateNetwork) {
                    _context8.next = 2;
                    break;
                  }
                  return _context8.abrupt("return", true);
                case 2:
                  url = this.buildApiUrl(NetworkManager.API_REMOVE_INVENTORY_ITEM, this.gameServerPort);
                  headers = _extends({
                    'Authorization': token
                  }, this.defaultHeaders);
                  data = {
                    userId: userId,
                    itemId: itemId,
                    type: type,
                    quantity: delta
                  };
                  _context8.prev = 5;
                  _context8.next = 8;
                  return HttpHelper.post(url, data, headers);
                case 8:
                  response = _context8.sent;
                  result = JSON.parse(response);
                  return _context8.abrupt("return", result.success);
                case 13:
                  _context8.prev = 13;
                  _context8.t0 = _context8["catch"](5);
                  this.handleError(_context8.t0);
                  return _context8.abrupt("return", false);
                case 17:
                case "end":
                  return _context8.stop();
              }
            }, _callee8, this, [[5, 13]]);
          }));
          function removeInventoryItem(_x20, _x21, _x22, _x23, _x24) {
            return _removeInventoryItem.apply(this, arguments);
          }
          return removeInventoryItem;
        }()
        /**
         * 商店购买物品
         * @param itemId 
         * @param num 
         * @returns 
         */;

        _proto.buyItem = /*#__PURE__*/
        function () {
          var _buyItem = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee9(itemId, num) {
            var url, headers, data, response, result;
            return _regeneratorRuntime().wrap(function _callee9$(_context9) {
              while (1) switch (_context9.prev = _context9.next) {
                case 0:
                  if (!this.simulateNetwork) {
                    _context9.next = 2;
                    break;
                  }
                  return _context9.abrupt("return", true);
                case 2:
                  url = this.buildApiUrl(NetworkManager.API_BUY_ITEM, this.gameServerPort);
                  headers = _extends({
                    'Authorization': this.token
                  }, this.defaultHeaders);
                  data = {
                    userid: this.userId,
                    itemid: itemId,
                    num: num
                  };
                  _context9.prev = 5;
                  _context9.next = 8;
                  return HttpHelper.post(url, data, headers);
                case 8:
                  response = _context9.sent;
                  result = JSON.parse(response);
                  this.eventTarget.emit(NetworkManager.EVENT_BUY_ITEM, result);
                  return _context9.abrupt("return", result.success);
                case 14:
                  _context9.prev = 14;
                  _context9.t0 = _context9["catch"](5);
                  this.handleError(_context9.t0);
                  return _context9.abrupt("return", false);
                case 18:
                case "end":
                  return _context9.stop();
              }
            }, _callee9, this, [[5, 14]]);
          }));
          function buyItem(_x25, _x26) {
            return _buyItem.apply(this, arguments);
          }
          return buyItem;
        }();
        _proto.sellItem = /*#__PURE__*/function () {
          var _sellItem = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee10(itemId, num) {
            var url, headers, data, response, result;
            return _regeneratorRuntime().wrap(function _callee10$(_context10) {
              while (1) switch (_context10.prev = _context10.next) {
                case 0:
                  if (!this.simulateNetwork) {
                    _context10.next = 2;
                    break;
                  }
                  return _context10.abrupt("return", true);
                case 2:
                  url = this.buildApiUrl(NetworkManager.API_SELL_ITEM, this.gameServerPort);
                  headers = _extends({
                    'Authorization': this.token
                  }, this.defaultHeaders);
                  data = {
                    userid: this.userId,
                    itemid: itemId,
                    num: num
                  };
                  _context10.prev = 5;
                  _context10.next = 8;
                  return HttpHelper.post(url, data, headers);
                case 8:
                  response = _context10.sent;
                  result = JSON.parse(response);
                  this.eventTarget.emit(NetworkManager.EVENT_SELL_ITEM, result);
                  return _context10.abrupt("return", result);
                case 14:
                  _context10.prev = 14;
                  _context10.t0 = _context10["catch"](5);
                  this.handleError(_context10.t0);
                  return _context10.abrupt("return", null);
                case 18:
                case "end":
                  return _context10.stop();
              }
            }, _callee10, this, [[5, 14]]);
          }));
          function sellItem(_x27, _x28) {
            return _sellItem.apply(this, arguments);
          }
          return sellItem;
        }();
        _proto.care = /*#__PURE__*/function () {
          var _care = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee11(sceneId) {
            var url, headers, data, response, result;
            return _regeneratorRuntime().wrap(function _callee11$(_context11) {
              while (1) switch (_context11.prev = _context11.next) {
                case 0:
                  if (!this.simulateNetwork) {
                    _context11.next = 2;
                    break;
                  }
                  return _context11.abrupt("return", null);
                case 2:
                  url = this.buildApiUrl(NetworkManager.API_CARE, this.gameServerPort);
                  headers = _extends({
                    'Authorization': this.token
                  }, this.defaultHeaders);
                  data = {
                    userid: this.userId,
                    sceneid: sceneId
                  };
                  _context11.prev = 5;
                  _context11.next = 8;
                  return HttpHelper.post(url, data, headers);
                case 8:
                  response = _context11.sent;
                  result = JSON.parse(response);
                  this.eventTarget.emit(NetworkManager.EVENT_CARE, result);
                  return _context11.abrupt("return", result);
                case 14:
                  _context11.prev = 14;
                  _context11.t0 = _context11["catch"](5);
                  this.handleError(_context11.t0);
                  return _context11.abrupt("return", null);
                case 18:
                case "end":
                  return _context11.stop();
              }
            }, _callee11, this, [[5, 14]]);
          }));
          function care(_x29) {
            return _care.apply(this, arguments);
          }
          return care;
        }();
        _proto.careFriend = /*#__PURE__*/function () {
          var _careFriend = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee12(sceneId, friendId) {
            var url, headers, data, response, result;
            return _regeneratorRuntime().wrap(function _callee12$(_context12) {
              while (1) switch (_context12.prev = _context12.next) {
                case 0:
                  if (!this.simulateNetwork) {
                    _context12.next = 2;
                    break;
                  }
                  return _context12.abrupt("return", null);
                case 2:
                  url = this.buildApiUrl(NetworkManager.API_CARE_FRIEND, this.gameServerPort);
                  headers = _extends({
                    'Authorization': this.token
                  }, this.defaultHeaders);
                  data = {
                    userid: this.userId,
                    sceneid: sceneId,
                    friendId: friendId
                  };
                  _context12.prev = 5;
                  _context12.next = 8;
                  return HttpHelper.post(url, data, headers);
                case 8:
                  response = _context12.sent;
                  result = JSON.parse(response);
                  this.eventTarget.emit(NetworkManager.EVENT_CARE_FRIEND, result);
                  return _context12.abrupt("return", result);
                case 14:
                  _context12.prev = 14;
                  _context12.t0 = _context12["catch"](5);
                  this.handleError(_context12.t0);
                  return _context12.abrupt("return", null);
                case 18:
                case "end":
                  return _context12.stop();
              }
            }, _callee12, this, [[5, 14]]);
          }));
          function careFriend(_x30, _x31) {
            return _careFriend.apply(this, arguments);
          }
          return careFriend;
        }();
        _proto.treat = /*#__PURE__*/function () {
          var _treat = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee13(sceneId) {
            var url, headers, data, response, result;
            return _regeneratorRuntime().wrap(function _callee13$(_context13) {
              while (1) switch (_context13.prev = _context13.next) {
                case 0:
                  if (!this.simulateNetwork) {
                    _context13.next = 2;
                    break;
                  }
                  return _context13.abrupt("return", null);
                case 2:
                  url = this.buildApiUrl(NetworkManager.API_TREAT, this.gameServerPort);
                  headers = _extends({
                    'Authorization': this.token
                  }, this.defaultHeaders);
                  data = {
                    userid: this.userId,
                    sceneid: sceneId
                  };
                  _context13.prev = 5;
                  _context13.next = 8;
                  return HttpHelper.post(url, data, headers);
                case 8:
                  response = _context13.sent;
                  result = JSON.parse(response);
                  this.eventTarget.emit(NetworkManager.EVENT_TREAT, result);
                  return _context13.abrupt("return", result);
                case 14:
                  _context13.prev = 14;
                  _context13.t0 = _context13["catch"](5);
                  this.handleError(_context13.t0);
                  return _context13.abrupt("return", null);
                case 18:
                case "end":
                  return _context13.stop();
              }
            }, _callee13, this, [[5, 14]]);
          }));
          function treat(_x32) {
            return _treat.apply(this, arguments);
          }
          return treat;
        }();
        _proto.treatFriend = /*#__PURE__*/function () {
          var _treatFriend = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee14(sceneId, friendId) {
            var url, headers, data, response, result;
            return _regeneratorRuntime().wrap(function _callee14$(_context14) {
              while (1) switch (_context14.prev = _context14.next) {
                case 0:
                  if (!this.simulateNetwork) {
                    _context14.next = 2;
                    break;
                  }
                  return _context14.abrupt("return", null);
                case 2:
                  url = this.buildApiUrl(NetworkManager.API_TREAT_FRIEND, this.gameServerPort);
                  headers = _extends({
                    'Authorization': this.token
                  }, this.defaultHeaders);
                  data = {
                    userid: this.userId,
                    sceneid: sceneId,
                    friendId: friendId
                  };
                  _context14.prev = 5;
                  _context14.next = 8;
                  return HttpHelper.post(url, data, headers);
                case 8:
                  response = _context14.sent;
                  result = JSON.parse(response);
                  this.eventTarget.emit(NetworkManager.EVENT_TREAT_FRIEND, result);
                  return _context14.abrupt("return", result);
                case 14:
                  _context14.prev = 14;
                  _context14.t0 = _context14["catch"](5);
                  this.handleError(_context14.t0);
                  return _context14.abrupt("return", null);
                case 18:
                case "end":
                  return _context14.stop();
              }
            }, _callee14, this, [[5, 14]]);
          }));
          function treatFriend(_x33, _x34) {
            return _treatFriend.apply(this, arguments);
          }
          return treatFriend;
        }() //cleanse
        ;

        _proto.cleanse = /*#__PURE__*/
        function () {
          var _cleanse = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee15(sceneId) {
            var url, headers, data, response, result;
            return _regeneratorRuntime().wrap(function _callee15$(_context15) {
              while (1) switch (_context15.prev = _context15.next) {
                case 0:
                  if (!this.simulateNetwork) {
                    _context15.next = 2;
                    break;
                  }
                  return _context15.abrupt("return", null);
                case 2:
                  url = this.buildApiUrl(NetworkManager.API_CLEANSE, this.gameServerPort);
                  headers = _extends({
                    'Authorization': this.token
                  }, this.defaultHeaders);
                  data = {
                    userid: this.userId,
                    sceneid: sceneId
                  };
                  _context15.prev = 5;
                  _context15.next = 8;
                  return HttpHelper.post(url, data, headers);
                case 8:
                  response = _context15.sent;
                  result = JSON.parse(response);
                  this.eventTarget.emit(NetworkManager.EVENT_CLEANSE, result);
                  return _context15.abrupt("return", result);
                case 14:
                  _context15.prev = 14;
                  _context15.t0 = _context15["catch"](5);
                  this.handleError(_context15.t0);
                  return _context15.abrupt("return", null);
                case 18:
                case "end":
                  return _context15.stop();
              }
            }, _callee15, this, [[5, 14]]);
          }));
          function cleanse(_x35) {
            return _cleanse.apply(this, arguments);
          }
          return cleanse;
        }() //cleanse friend
        ;

        _proto.cleanseFriend = /*#__PURE__*/
        function () {
          var _cleanseFriend = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee16(sceneId, friendId) {
            var url, headers, data, response, result;
            return _regeneratorRuntime().wrap(function _callee16$(_context16) {
              while (1) switch (_context16.prev = _context16.next) {
                case 0:
                  if (!this.simulateNetwork) {
                    _context16.next = 2;
                    break;
                  }
                  return _context16.abrupt("return", null);
                case 2:
                  url = this.buildApiUrl(NetworkManager.API_CLEANSE_FRIEND, this.gameServerPort);
                  headers = _extends({
                    'Authorization': this.token
                  }, this.defaultHeaders);
                  data = {
                    userid: this.userId,
                    sceneid: sceneId,
                    friendId: friendId
                  };
                  _context16.prev = 5;
                  _context16.next = 8;
                  return HttpHelper.post(url, data, headers);
                case 8:
                  response = _context16.sent;
                  result = JSON.parse(response);
                  return _context16.abrupt("return", result);
                case 13:
                  _context16.prev = 13;
                  _context16.t0 = _context16["catch"](5);
                  this.handleError(_context16.t0);
                  return _context16.abrupt("return", null);
                case 17:
                case "end":
                  return _context16.stop();
              }
            }, _callee16, this, [[5, 13]]);
          }));
          function cleanseFriend(_x36, _x37) {
            return _cleanseFriend.apply(this, arguments);
          }
          return cleanseFriend;
        }() // Disease status update
        ;

        _proto.updateDiseaseStatus = /*#__PURE__*/
        function () {
          var _updateDiseaseStatus = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee17(sceneId, updateDiseaseTimes) {
            var url, headers, data, response, result;
            return _regeneratorRuntime().wrap(function _callee17$(_context17) {
              while (1) switch (_context17.prev = _context17.next) {
                case 0:
                  if (!this.simulateNetwork) {
                    _context17.next = 2;
                    break;
                  }
                  return _context17.abrupt("return", null);
                case 2:
                  url = this.buildApiUrl(NetworkManager.API_UPDATE_DISEASE_STATUS, this.gameServerPort);
                  headers = _extends({
                    'Authorization': this.token
                  }, this.defaultHeaders);
                  data = {
                    userid: this.userId,
                    sceneid: sceneId,
                    updateDiseaseTimes: updateDiseaseTimes
                  };
                  _context17.prev = 5;
                  _context17.next = 8;
                  return HttpHelper.post(url, data, headers);
                case 8:
                  response = _context17.sent;
                  result = JSON.parse(response);
                  this.eventTarget.emit(NetworkManager.EVENT_UPDATE_DISEASE_STATUS, result);
                  return _context17.abrupt("return", result);
                case 14:
                  _context17.prev = 14;
                  _context17.t0 = _context17["catch"](5);
                  this.handleError(_context17.t0);
                  return _context17.abrupt("return", null);
                case 18:
                case "end":
                  return _context17.stop();
              }
            }, _callee17, this, [[5, 14]]);
          }));
          function updateDiseaseStatus(_x38, _x39) {
            return _updateDiseaseStatus.apply(this, arguments);
          }
          return updateDiseaseStatus;
        }();
        _proto.addBuilding = /*#__PURE__*/function () {
          var _addBuilding = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee18(itemId, x, y, parent_node_name) {
            var url, headers, data, response, result;
            return _regeneratorRuntime().wrap(function _callee18$(_context18) {
              while (1) switch (_context18.prev = _context18.next) {
                case 0:
                  if (!this.simulateNetwork) {
                    _context18.next = 2;
                    break;
                  }
                  return _context18.abrupt("return", null);
                case 2:
                  url = this.buildApiUrl(NetworkManager.API_ADD_BUILDING, this.gameServerPort);
                  headers = _extends({
                    'Authorization': this.token
                  }, this.defaultHeaders);
                  data = {
                    userid: this.userId,
                    buildingId: itemId,
                    x: x,
                    y: y,
                    parent_node_name: parent_node_name
                  };
                  _context18.prev = 5;
                  _context18.next = 8;
                  return HttpHelper.post(url, data, headers);
                case 8:
                  response = _context18.sent;
                  result = JSON.parse(response);
                  return _context18.abrupt("return", result);
                case 13:
                  _context18.prev = 13;
                  _context18.t0 = _context18["catch"](5);
                  this.handleError(_context18.t0);
                  return _context18.abrupt("return", null);
                case 17:
                case "end":
                  return _context18.stop();
              }
            }, _callee18, this, [[5, 13]]);
          }));
          function addBuilding(_x40, _x41, _x42, _x43) {
            return _addBuilding.apply(this, arguments);
          }
          return addBuilding;
        }();
        _proto.querySceneSyntheList = /*#__PURE__*/function () {
          var _querySceneSyntheList = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee19(sceneId) {
            var url, headers, data, response, result;
            return _regeneratorRuntime().wrap(function _callee19$(_context19) {
              while (1) switch (_context19.prev = _context19.next) {
                case 0:
                  if (!this.simulateNetwork) {
                    _context19.next = 2;
                    break;
                  }
                  return _context19.abrupt("return", null);
                case 2:
                  url = this.buildApiUrl(NetworkManager.API_QUERY_SYNTHE_LIST, this.gameServerPort);
                  headers = _extends({
                    'Authorization': this.token
                  }, this.defaultHeaders);
                  data = {
                    sceneId: sceneId
                  };
                  _context19.prev = 5;
                  _context19.next = 8;
                  return HttpHelper.post(url, data, headers);
                case 8:
                  response = _context19.sent;
                  result = JSON.parse(response);
                  return _context19.abrupt("return", result);
                case 13:
                  _context19.prev = 13;
                  _context19.t0 = _context19["catch"](5);
                  this.handleError(_context19.t0);
                  return _context19.abrupt("return", null);
                case 17:
                case "end":
                  return _context19.stop();
              }
            }, _callee19, this, [[5, 13]]);
          }));
          function querySceneSyntheList(_x44) {
            return _querySceneSyntheList.apply(this, arguments);
          }
          return querySceneSyntheList;
        }() //implement start synthe
        ;

        _proto.syntheStart = /*#__PURE__*/
        function () {
          var _syntheStart = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee20(syntheId, sceneId) {
            var url, headers, data, response, result;
            return _regeneratorRuntime().wrap(function _callee20$(_context20) {
              while (1) switch (_context20.prev = _context20.next) {
                case 0:
                  if (!this.simulateNetwork) {
                    _context20.next = 2;
                    break;
                  }
                  return _context20.abrupt("return", null);
                case 2:
                  url = this.buildApiUrl(NetworkManager.API_START_SYNTHE, this.gameServerPort);
                  headers = _extends({
                    'Authorization': this.token
                  }, this.defaultHeaders);
                  data = {
                    userId: this.userId,
                    sceneId: sceneId,
                    syntheId: syntheId
                  };
                  _context20.prev = 5;
                  _context20.next = 8;
                  return HttpHelper.post(url, data, headers);
                case 8:
                  response = _context20.sent;
                  result = JSON.parse(response);
                  return _context20.abrupt("return", result);
                case 13:
                  _context20.prev = 13;
                  _context20.t0 = _context20["catch"](5);
                  this.handleError(_context20.t0);
                  return _context20.abrupt("return", null);
                case 17:
                case "end":
                  return _context20.stop();
              }
            }, _callee20, this, [[5, 13]]);
          }));
          function syntheStart(_x45, _x46) {
            return _syntheStart.apply(this, arguments);
          }
          return syntheStart;
        }();
        _proto.syntheEnd = /*#__PURE__*/function () {
          var _syntheEnd = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee21(sceneId, syntheId) {
            var url, headers, data, response, result;
            return _regeneratorRuntime().wrap(function _callee21$(_context21) {
              while (1) switch (_context21.prev = _context21.next) {
                case 0:
                  if (!this.simulateNetwork) {
                    _context21.next = 2;
                    break;
                  }
                  return _context21.abrupt("return", null);
                case 2:
                  url = this.buildApiUrl(NetworkManager.API_SYNTHE_END, this.gameServerPort);
                  headers = _extends({
                    'Authorization': this.token
                  }, this.defaultHeaders);
                  data = {
                    userId: this.userId,
                    sceneId: sceneId,
                    syntheId: syntheId
                  };
                  _context21.prev = 5;
                  _context21.next = 8;
                  return HttpHelper.post(url, data, headers);
                case 8:
                  response = _context21.sent;
                  result = JSON.parse(response);
                  return _context21.abrupt("return", result);
                case 13:
                  _context21.prev = 13;
                  _context21.t0 = _context21["catch"](5);
                  this.handleError(_context21.t0);
                  return _context21.abrupt("return", null);
                case 17:
                case "end":
                  return _context21.stop();
              }
            }, _callee21, this, [[5, 13]]);
          }));
          function syntheEnd(_x47, _x48) {
            return _syntheEnd.apply(this, arguments);
          }
          return syntheEnd;
        }();
        _proto.visit = /*#__PURE__*/function () {
          var _visit = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee22(userId) {
            var url, headers, data, response, result;
            return _regeneratorRuntime().wrap(function _callee22$(_context22) {
              while (1) switch (_context22.prev = _context22.next) {
                case 0:
                  if (!this.simulateNetwork) {
                    _context22.next = 2;
                    break;
                  }
                  return _context22.abrupt("return", null);
                case 2:
                  url = this.buildApiUrl(NetworkManager.API_VISIT, this.gameServerPort);
                  headers = _extends({
                    'Authorization': this.token
                  }, this.defaultHeaders);
                  data = {
                    userid: userId //The friend's userid
                  };

                  _context22.prev = 5;
                  _context22.next = 8;
                  return HttpHelper.post(url, data, headers);
                case 8:
                  response = _context22.sent;
                  result = JSON.parse(response);
                  console.log("visit result: " + JSON.stringify(result));
                  //this.eventTarget.emit(NetworkManager.EVENT_VISIT, result);
                  return _context22.abrupt("return", result);
                case 14:
                  _context22.prev = 14;
                  _context22.t0 = _context22["catch"](5);
                  this.handleError(_context22.t0);
                  return _context22.abrupt("return", null);
                case 18:
                case "end":
                  return _context22.stop();
              }
            }, _callee22, this, [[5, 14]]);
          }));
          function visit(_x49) {
            return _visit.apply(this, arguments);
          }
          return visit;
        }() //recommend friend
        ;

        _proto.recommendFriends = /*#__PURE__*/
        function () {
          var _recommendFriends = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee23(userId, num) {
            var url, headers, data, response, result;
            return _regeneratorRuntime().wrap(function _callee23$(_context23) {
              while (1) switch (_context23.prev = _context23.next) {
                case 0:
                  if (!this.simulateNetwork) {
                    _context23.next = 2;
                    break;
                  }
                  return _context23.abrupt("return", null);
                case 2:
                  url = this.buildApiUrl(NetworkManager.API_RECOMMEND_FRIENDS, this.gameServerPort);
                  headers = _extends({
                    'Authorization': this.token
                  }, this.defaultHeaders);
                  data = {
                    userid: userId,
                    recommendNum: num
                  };
                  _context23.prev = 5;
                  _context23.next = 8;
                  return HttpHelper.post(url, data, headers);
                case 8:
                  response = _context23.sent;
                  result = JSON.parse(response);
                  return _context23.abrupt("return", result);
                case 13:
                  _context23.prev = 13;
                  _context23.t0 = _context23["catch"](5);
                  this.handleError(_context23.t0);
                  return _context23.abrupt("return", null);
                case 17:
                case "end":
                  return _context23.stop();
              }
            }, _callee23, this, [[5, 13]]);
          }));
          function recommendFriends(_x50, _x51) {
            return _recommendFriends.apply(this, arguments);
          }
          return recommendFriends;
        }() //implement queryPaymentResult
        ;

        _proto.queryPaymentResult = /*#__PURE__*/
        function () {
          var _queryPaymentResult = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee24(gameId, paymentId) {
            var url, headers, data, response, result;
            return _regeneratorRuntime().wrap(function _callee24$(_context24) {
              while (1) switch (_context24.prev = _context24.next) {
                case 0:
                  if (!this.simulateNetwork) {
                    _context24.next = 2;
                    break;
                  }
                  return _context24.abrupt("return", null);
                case 2:
                  url = this.buildApiUrl(NetworkManager.API_QUERY_PAYMENT_RESULT, this.paymentPort);
                  headers = _extends({
                    'Authorization': this.token
                  }, this.defaultHeaders);
                  data = {
                    user_id: this.userId,
                    game_id: gameId,
                    payment_id: paymentId
                  };
                  _context24.prev = 5;
                  _context24.next = 8;
                  return HttpHelper.post(url, data, headers);
                case 8:
                  response = _context24.sent;
                  result = JSON.parse(response);
                  return _context24.abrupt("return", result);
                case 13:
                  _context24.prev = 13;
                  _context24.t0 = _context24["catch"](5);
                  this.handleError(_context24.t0);
                  return _context24.abrupt("return", null);
                case 17:
                case "end":
                  return _context24.stop();
              }
            }, _callee24, this, [[5, 13]]);
          }));
          function queryPaymentResult(_x52, _x53) {
            return _queryPaymentResult.apply(this, arguments);
          }
          return queryPaymentResult;
        }();
        _proto.handleError = function handleError(error) {
          console.error('Network error:', error);
          // 这里可以添加更多的错误处理逻辑，比如显示错误提示等
        };

        _proto.delay = function delay(ms) {
          return new Promise(function (resolve) {
            return setTimeout(resolve, ms);
          });
        };
        _createClass(NetworkManager, [{
          key: "baseUrl",
          get: function get() {
            // Check if the game is running in preview mode (local development)
            {
              return "https://farmlinker-tma-test.dashfun.games"; //"https://server-test.farmslinker.com";//"https://farmlinker-tma-test.dashfun.games";//this.serverBaseUrl;
            }
          }
        }, {
          key: "SimulateNetwork",
          get:
          //getter simulateNetwork
          function get() {
            return this.simulateNetwork;
          }
        }, {
          key: "defaultHeaders",
          get: function get() {
            try {
              return JSON.parse(this.defaultHeadersJson);
            } catch (error) {
              console.error('Invalid default headers JSON:', error);
              return {};
            }
          }
        }], [{
          key: "instance",
          get: function get() {
            return this._instance;
          }
        }]);
        return NetworkManager;
      }(Component), _class3.API_LOGIN = "/login", _class3.API_GET_LATEST_COMMAND_DURATION = "/game/getLatestCommandDuration", _class3.API_GET_USER_SCENE_ITEMS = "/game/getUserSceneItems", _class3.API_UPDATE_AVATAR_URL = "/user/updateAvatarUrl", _class3.API_PLANT = "/game/plant", _class3.API_ADD_INVENTORY_ITEM = "/inventory/add", _class3.API_REMOVE_INVENTORY_ITEM = "/inventory/remove", _class3.API_HARVEST = "/game/harvest", _class3.API_BUY_ITEM = "/game/buyItem", _class3.API_SELL_ITEM = "/game/sellItem", _class3.API_CARE = "/game/care", _class3.API_CARE_FRIEND = "/game/careFriend", _class3.API_TREAT = "/game/treat", _class3.API_TREAT_FRIEND = "/game/treatFriend", _class3.API_CLEANSE = "/game/cleanse", _class3.API_CLEANSE_FRIEND = "/game/cleanseFriend", _class3.API_QUERY_DISEASE_STATUS = "/game/queryDiseaseStatus", _class3.API_UPDATE_DISEASE_STATUS = '/game/updateDiseaseStatus', _class3.API_QUERY_SYNTHE_LIST = '/game/getSyntheList', _class3.API_START_SYNTHE = '/game/startSynthe', _class3.API_SYNTHE_END = '/game/syntheEnd', _class3.API_VISIT = '/game/visit', _class3.API_ADD_BUILDING = '/scene/addBuilding', _class3.API_RECOMMEND_FRIENDS = '/friend/recommend', _class3.API_QUERY_PAYMENT_RESULT = '/payment/queryPaymentResult', _class3.EVENT_LOGIN_SUCCESS = 'login-success', _class3.EVENT_LOGIN_FAILED = 'login-failed', _class3.EVENT_GET_USER_SCENE_ITEMS = 'get-user-scene-items', _class3.EVENT_PLANT = 'plant', _class3.EVENT_HARVEST = 'harvest', _class3.EVENT_BUY_ITEM = 'buy-item', _class3.EVENT_SELL_ITEM = 'sell-item', _class3.EVENT_CARE = 'care', _class3.EVENT_CARE_FRIEND = 'care-friend', _class3.EVENT_TREAT = 'treat', _class3.EVENT_TREAT_FRIEND = 'treat-friend', _class3.EVENT_CLEANSE = 'cleanse', _class3.EVENT_UPDATE_DISEASE_STATUS = 'update-disease-status', _class3.EVENT_QUERY_DISEASE_STATUS = 'query-disease-status', _class3._instance = null, _class3), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "localBaseUrl", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 'http://localhost';
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "serverBaseUrl", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 'https://your-server-domain.com';
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "loginPort", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 3000;
        }
      }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "gameServerPort", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 3001;
        }
      }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "paymentPort", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 3003;
        }
      }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "maxLoginRetries", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 3;
        }
      }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "defaultHeadersJson", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return '{}';
        }
      }), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "simulateNetwork", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return false;
        }
      })), _class2)) || _class));
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/NetworkPlayerState.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './PlayerState.ts'], function (exports) {
  var _inheritsLoose, _createClass, cclegacy, _decorator, PlayerState;
  return {
    setters: [function (module) {
      _inheritsLoose = module.inheritsLoose;
      _createClass = module.createClass;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
    }, function (module) {
      PlayerState = module.PlayerState;
    }],
    execute: function () {
      var _dec, _class;
      cclegacy._RF.push({}, "e5169bD9fRIEpz/vWDeOzaP", "NetworkPlayerState", undefined);
      var ccclass = _decorator.ccclass,
        property = _decorator.property;
      var NetworkPlayerState = exports('NetworkPlayerState', (_dec = ccclass('NetworkPlayerState'), _dec(_class = /*#__PURE__*/function (_PlayerState) {
        _inheritsLoose(NetworkPlayerState, _PlayerState);
        function NetworkPlayerState(userData, token) {
          var _this;
          _this = _PlayerState.call(this, userData.level, userData.exp, userData.coin, userData.diamond) || this;
          _this._id = '';
          _this._nickname = '';
          _this._registerTime = new Date();
          _this._lastLoginTime = new Date();
          _this._token = '';
          _this.initialize(userData, token);
          return _this;
        }
        var _proto = NetworkPlayerState.prototype;
        _proto.initialize = function initialize(userData, token) {
          this._id = userData.id;
          this._nickname = userData.nickname;
          this.level = userData.level;
          this.experience = userData.exp;
          this.gold = userData.coin;
          this.diamond = userData.diamond;
          this._registerTime = new Date(userData.register_time);
          this._lastLoginTime = new Date(userData.last_login_time);
          this._token = token;

          // 触发更新事件
          this.eventTarget.emit('player-state-updated');
        };
        _createClass(NetworkPlayerState, [{
          key: "Id",
          get:
          // Getters
          function get() {
            return this._id;
          }
        }, {
          key: "Nickname",
          get: function get() {
            return this._nickname;
          }
        }, {
          key: "RegisterTime",
          get: function get() {
            return this._registerTime;
          }
        }, {
          key: "LastLoginTime",
          get: function get() {
            return this._lastLoginTime;
          }
        }, {
          key: "Token",
          get: function get() {
            return this._token;
          }
        }]);
        return NetworkPlayerState;
      }(PlayerState)) || _class));
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/PlayerController.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './PlayerState.ts', './InventoryComponent.ts', './InputComonent.ts', './BuildingManager.ts', './BuildingPlacementComponent.ts', './SharedDefines.ts', './DragDropComponent.ts', './Fence.ts', './PlotTile.ts', './ItemDataManager.ts', './NetworkManager.ts', './WindowManager.ts', './Building.ts'], function (exports) {
  var _applyDecoratedDescriptor, _inheritsLoose, _initializerDefineProperty, _assertThisInitialized, _createForOfIteratorHelperLoose, _createClass, cclegacy, _decorator, CCInteger, CCString, Prefab, Size, EventTarget, director, Camera, Director, UITransform, Vec3, Layers, Vec2, PhysicsSystem2D, instantiate, Component, PlayerState, InventoryComponent, InventoryItem, InputComponent, BuildingManager, BuildingPlacementComponent, InteractionMode, SharedDefines, DragDropComponent, Fence, PlotTile, ItemDataManager, NetworkManager, WindowManager, Building;
  return {
    setters: [function (module) {
      _applyDecoratedDescriptor = module.applyDecoratedDescriptor;
      _inheritsLoose = module.inheritsLoose;
      _initializerDefineProperty = module.initializerDefineProperty;
      _assertThisInitialized = module.assertThisInitialized;
      _createForOfIteratorHelperLoose = module.createForOfIteratorHelperLoose;
      _createClass = module.createClass;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      CCInteger = module.CCInteger;
      CCString = module.CCString;
      Prefab = module.Prefab;
      Size = module.Size;
      EventTarget = module.EventTarget;
      director = module.director;
      Camera = module.Camera;
      Director = module.Director;
      UITransform = module.UITransform;
      Vec3 = module.Vec3;
      Layers = module.Layers;
      Vec2 = module.Vec2;
      PhysicsSystem2D = module.PhysicsSystem2D;
      instantiate = module.instantiate;
      Component = module.Component;
    }, function (module) {
      PlayerState = module.PlayerState;
    }, function (module) {
      InventoryComponent = module.InventoryComponent;
      InventoryItem = module.InventoryItem;
    }, function (module) {
      InputComponent = module.InputComponent;
    }, function (module) {
      BuildingManager = module.BuildingManager;
    }, function (module) {
      BuildingPlacementComponent = module.BuildingPlacementComponent;
    }, function (module) {
      InteractionMode = module.InteractionMode;
      SharedDefines = module.SharedDefines;
    }, function (module) {
      DragDropComponent = module.DragDropComponent;
    }, function (module) {
      Fence = module.Fence;
    }, function (module) {
      PlotTile = module.PlotTile;
    }, function (module) {
      ItemDataManager = module.ItemDataManager;
    }, function (module) {
      NetworkManager = module.NetworkManager;
    }, function (module) {
      WindowManager = module.WindowManager;
    }, function (module) {
      Building = module.Building;
    }],
    execute: function () {
      var _dec, _dec2, _dec3, _dec4, _dec5, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4;
      cclegacy._RF.push({}, "a9bf4Nd29tBnIxnzrQhHcwm", "PlayerController", undefined);
      var ccclass = _decorator.ccclass,
        property = _decorator.property;
      var PlayerController = exports('PlayerController', (_dec = ccclass('PlayerController'), _dec2 = property(CCInteger), _dec3 = property(CCInteger), _dec4 = property(CCString), _dec5 = property(Prefab), _dec(_class = (_class2 = /*#__PURE__*/function (_Component) {
        _inheritsLoose(PlayerController, _Component);
        function PlayerController() {
          var _this;
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          _this = _Component.call.apply(_Component, [this].concat(args)) || this;
          _this.backgroundNode = null;
          _this.backgroundSize = new Size(0, 0);
          _initializerDefineProperty(_this, "initialMoney", _descriptor, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "initialLevel", _descriptor2, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "initialItemIds", _descriptor3, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "placementBuildingPrefab", _descriptor4, _assertThisInitialized(_this));
          _this._visitMode = false;
          _this._inputComponent = null;
          _this._inventoryComponent = void 0;
          _this._camera = void 0;
          _this.currentBuildingPlacement = null;
          _this.dragDropComponent = null;
          _this._playerState = void 0;
          _this._friendState = void 0;
          _this.eventTarget = new EventTarget();
          _this._interactionMode = InteractionMode.CameraDrag;
          return _this;
        }
        var _proto = PlayerController.prototype;
        _proto.onLoad = function onLoad() {
          this._playerState = new PlayerState("0", 1, 0, this.initialMoney, 0);
          this._inventoryComponent = this.node.getComponent(InventoryComponent);
          if (!this._camera) {
            this._camera = director.getScene().getComponentInChildren(Camera);
          }
          var inputNode = Director.instance.getScene().getChildByPath(SharedDefines.PATH_INPUT_NODE);
          if (inputNode) {
            this._inputComponent = inputNode.getComponent(InputComponent);
            this._inputComponent.onClick = this.handleClick.bind(this);
            this._inputComponent.onTouchStart = this.handleTouchStart.bind(this);
            this._inputComponent.onTouchMove = this.handleTouchMove.bind(this);
            this._inputComponent.onTouchEnd = this.handleTouchEnd.bind(this);
          } else {
            console.error('No InputNode found');
            return;
          }
          this.dragDropComponent = inputNode.addComponent(DragDropComponent);
          var fence = Director.instance.getScene().getComponentInChildren(Fence);
          this.dragDropComponent.registerDropZone(fence);
          var canvas = director.getScene().getChildByPath(SharedDefines.PATH_GAMEPLAY_CANVAS);
          this.backgroundNode = canvas == null ? void 0 : canvas.getChildByPath('Gameplay/BG');
          if (this.backgroundNode) {
            var uiTransform = this.backgroundNode.getComponent(UITransform);
            if (uiTransform) {
              this.backgroundSize = uiTransform.contentSize;
            }
          }
        };
        _proto.start = function start() {
          if (NetworkManager.instance.SimulateNetwork) {
            //for initial money
            this._playerState.addGold(this.initialMoney);
            this._playerState.level = this.initialLevel;
            //for initial items
            for (var _iterator = _createForOfIteratorHelperLoose(this.initialItemIds), _step; !(_step = _iterator()).done;) {
              var itemId = _step.value;
              var item = ItemDataManager.instance.getItemById(itemId);
              if (item) {
                var inventoryItem = new InventoryItem(item);
                this._inventoryComponent.addItem(inventoryItem);
              }
            }
          }
        };
        _proto.update = function update(deltaTime) {};
        _proto.handleTouchStart = function handleTouchStart(event) {
          if (this.interactionMode !== InteractionMode.CameraDrag) {
            return;
          }
          this.interactionMode = InteractionMode.CameraDrag;
        };
        _proto.handleTouchMove = function handleTouchMove(event) {
          if (this.interactionMode === InteractionMode.CameraDrag) {
            this.moveCamera(event.getDelta());
          }
        };
        _proto.handleTouchEnd = function handleTouchEnd(event) {
          if (this.interactionMode === InteractionMode.CameraDrag) {
            // In any case, reset to camera drag mode
            this.interactionMode = InteractionMode.CameraDrag;
          }
        };
        _proto.moveCamera = function moveCamera(delta) {
          if (!this._camera || !this.backgroundNode) return;
          var currentPosition = this._camera.node.position;
          var orthoHeight = this._camera.orthoHeight;
          var aspectRatio = this._camera.camera.aspect;
          var orthoWidth = orthoHeight * aspectRatio;

          // Calculate the background's center position
          var bgCenterX = 0;
          var bgCenterY = 0;

          // Calculate the camera's movement limits
          var minX = bgCenterX - this.backgroundSize.width / 2 + orthoWidth;
          var maxX = bgCenterX + this.backgroundSize.width / 2 - orthoWidth;
          var minY = bgCenterY - this.backgroundSize.height / 2 + orthoHeight;
          var maxY = bgCenterY + this.backgroundSize.height / 2 - orthoHeight;
          var newX = Math.max(minX, Math.min(maxX, currentPosition.x - delta.x));
          var newY = Math.max(minY, Math.min(maxY, currentPosition.y - delta.y));
          var newPosition = new Vec3(newX, newY, currentPosition.z);
          this._camera.node.setPosition(newPosition);
        };
        _proto.handleClick = function handleClick(event) {
          //if dragging, return
          if (this.dragDropComponent && this.dragDropComponent.IsDragging) {
            return;
          }
          var colliders = this.getCollidersByClickPosition(event.getLocation());
          if (colliders) {
            var fenceLayer = 1 << Layers.nameToLayer(SharedDefines.LAYER_FENCE_NAME);
            //plot layer
            var plotLayer = 1 << Layers.nameToLayer(SharedDefines.LAYER_PLOTTILE_NAME);
            var buildingLayer = 1 << Layers.nameToLayer(SharedDefines.LAYER_BUILDING_NAME);
            for (var _iterator2 = _createForOfIteratorHelperLoose(colliders), _step2; !(_step2 = _iterator2()).done;) {
              var collider = _step2.value;
              //get layer of collider

              if (collider.node.layer & fenceLayer) {
                var fenceComponent = collider.node.getComponent(Fence);
                if (fenceComponent) {
                  if (!this.visitMode && fenceComponent.IsPlayerOwner || this.visitMode && !fenceComponent.IsPlayerOwner) {
                    var worldPos = this._camera.screenToWorld(new Vec3(event.getLocation().x, event.getLocation().y, 0));
                    fenceComponent.select(this.dragDropComponent, new Vec2(worldPos.x, worldPos.y));
                  }
                } else {
                  console.error('Fence node does not have Fence component');
                  return;
                }
                //this.showSelectionWindow(FarmSelectionType.FENCE,collider.node,event.getLocation());
              } else if (collider.node.layer & plotLayer) {
                var plotTile = collider.node.getComponent(PlotTile);
                if (plotTile) {
                  if (!this.visitMode && plotTile.IsPlayerOwner || this.visitMode && !plotTile.IsPlayerOwner) {
                    this.dragDropComponent.registerDropZone(plotTile);
                    plotTile.select(this.dragDropComponent);
                  }
                } else {
                  console.error('PlotTile node does not have PlotTile component');
                  return;
                }
              } else if (collider.node.layer & buildingLayer && !this.visitMode) {
                var building = collider.node.getComponent(Building);
                if (building && building.isFactory) {
                  WindowManager.instance.show(SharedDefines.WINDOW_FARM_FACTORY_NAME, building);
                }
              }
            }
          }
        };
        _proto.getCollidersByClickPosition = function getCollidersByClickPosition(position) {
          if (!this._camera) {
            console.error('Camera not set. Cannot perform touch detection.');
            return;
          }
          var touchLocation = position;
          var worldPosition = this._camera.screenToWorld(new Vec3(touchLocation.x, touchLocation.y, 0));
          var result = PhysicsSystem2D.instance.testPoint(new Vec2(worldPosition.x, worldPosition.y));
          if (result.length > 0) {
            //const hitCollider = result[0].node.;
            console.log('Hit object:', result[0].node.name);
            // 在这里处理击中对象的逻辑
            // 可以根据对象的标签或其他属性来判断是否为篱笆
            // if (hitCollider.node.layer === PlayerController.FENCE_MASK) {
            //     console.log('Hit a fence');
            //     // 处理击中篱笆的逻辑
            // }
          } else {
            console.log('Did not hit any object');
          }
          return result;
        }
        //#endregion

        //#region building placement
        ;

        _proto.startBuildingPlacement = function startBuildingPlacement(buildData, placementContainer) {
          if (this.interactionMode !== InteractionMode.CameraDrag) return;
          this.interactionMode = InteractionMode.BuildingPlacement;
          var buildingNode = instantiate(this.placementBuildingPrefab);
          if (!placementContainer) {
            var canvas = Director.instance.getScene().getChildByName("Canvas");
            canvas.addChild(buildingNode);
          } else {
            placementContainer.addChild(buildingNode);
          }
          this.currentBuildingPlacement = buildingNode.addComponent(BuildingPlacementComponent);
          this.currentBuildingPlacement.initialize(buildData, BuildingManager.instance);

          // 设置触摸事件处理
          if (this._inputComponent) {
            this._inputComponent.onTouchStart = this.currentBuildingPlacement.onTouchStart.bind(this.currentBuildingPlacement);
            this._inputComponent.onTouchMove = this.currentBuildingPlacement.onTouchMove.bind(this.currentBuildingPlacement);
            // this._inputComponent.onTouchEnd = this.currentBuildingPlacement.onTouchEnd.bind(this.currentBuildingPlacement);
            // this._inputComponent.onTouchCancel = this.currentBuildingPlacement.onTouchCancel.bind(this.currentBuildingPlacement);
          }
        };

        _proto.tryPlacementBuilding = function tryPlacementBuilding() {
          var _this2 = this;
          if (!this.currentBuildingPlacement) {
            return false;
          }
          if (this.currentBuildingPlacement.canPlaceBuilding()) {
            this.currentBuildingPlacement.placeBuilding(function (result) {
              if (result.success) {
                //add gold and diamond
                _this2._playerState.gold = result.data.coin;
                _this2._playerState.diamond = result.data.diamond;
                _this2._playerState.prosperity = result.data.prosperity;
              }
              _this2.endBuildingPlacement();
              _this2.eventTarget.emit(SharedDefines.EVENT_PLAYER_PLACEMENT_BUILDING, true);
            });
            return true;
          }
          return false;
        };
        _proto.cancelBuildingPlacement = function cancelBuildingPlacement() {
          if (this.currentBuildingPlacement) {
            this.currentBuildingPlacement.cancelPlacement();
            this.eventTarget.emit(SharedDefines.EVENT_PLAYER_PLACEMENT_BUILDING, false);
            this.endBuildingPlacement();
          }
        };
        _proto.endBuildingPlacement = function endBuildingPlacement() {
          if (this.currentBuildingPlacement) {
            //this.currentBuildingPlacement.finalizePlacement();
            this.currentBuildingPlacement = null;
          }

          // 清除触摸事件处理
          if (this._inputComponent) {
            this._inputComponent.onTouchStart = this.handleTouchStart.bind(this);
            this._inputComponent.onTouchMove = this.handleTouchMove.bind(this);
            this._inputComponent.onTouchEnd = this.handleTouchEnd.bind(this);
            this._inputComponent.onTouchCancel = null;
          }
          this.interactionMode = InteractionMode.CameraDrag;
        }

        //#endregion
        ;

        _proto.harvestCrop = function harvestCrop(cropValue) {
          this._playerState.addGold(cropValue);
          this._playerState.addExperience(10); // Suppose 10 experience for each crop
        };

        _createClass(PlayerController, [{
          key: "inputComponent",
          get:
          //getter inputcomponent
          function get() {
            return this._inputComponent;
          }

          //getter visitmode
        }, {
          key: "visitMode",
          get: function get() {
            return this._visitMode;
          }

          //setter visitmode
          ,

          set: function set(value) {
            this._visitMode = value;
            this.eventTarget.emit(SharedDefines.EVENT_VISIT_MODE_CHANGE, value);
          }
        }, {
          key: "playerState",
          get:
          //getter playerstate
          function get() {
            return this._playerState;
          }
        }, {
          key: "friendState",
          get:
          //getter friendstate
          function get() {
            return this._friendState;
          }
          //setter friendstate
          ,

          set: function set(value) {
            this._friendState = value;
          }
        }, {
          key: "inventoryComponent",
          get:
          //getter inventorycomponent
          function get() {
            return this._inventoryComponent;
          }
        }, {
          key: "interactionMode",
          get:
          //getter
          function get() {
            return this._interactionMode;
          }
          //setter interactionmode
          ,

          set: function set(value) {
            this._interactionMode = value;
          }
        }]);
        return PlayerController;
      }(Component), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "initialMoney", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 20;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "initialLevel", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 1;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "initialItemIds", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return [];
        }
      }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "placementBuildingPrefab", [_dec5], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      })), _class2)) || _class));
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/PlayerState.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './SharedDefines.ts'], function (exports) {
  var _createClass, cclegacy, EventTarget, SharedDefines;
  return {
    setters: [function (module) {
      _createClass = module.createClass;
    }, function (module) {
      cclegacy = module.cclegacy;
      EventTarget = module.EventTarget;
    }, function (module) {
      SharedDefines = module.SharedDefines;
    }],
    execute: function () {
      cclegacy._RF.push({}, "915bfk2uhNHXqVxOgQAiJwb", "PlayerState", undefined);
      var PlayerState = exports('PlayerState', /*#__PURE__*/function () {
        function PlayerState(id, initialLevel, initialExperience, initialGold, initialDiamond) {
          if (initialLevel === void 0) {
            initialLevel = 1;
          }
          if (initialExperience === void 0) {
            initialExperience = 0;
          }
          if (initialGold === void 0) {
            initialGold = 0;
          }
          if (initialDiamond === void 0) {
            initialDiamond = 0;
          }
          this._id = '';
          this._nickname = '';
          this._registerTime = new Date();
          this._lastLoginTime = new Date();
          this._token = '';
          this._level = void 0;
          this._experience = void 0;
          this._gold = void 0;
          this._diamond = void 0;
          this._prosperity = void 0;
          this._headUrl = '';
          this.eventTarget = void 0;
          this._id = id;
          this._level = initialLevel;
          this._experience = initialExperience;
          this._gold = initialGold;
          this._diamond = initialDiamond;
          this.eventTarget = new EventTarget();
        }
        var _proto = PlayerState.prototype;
        _proto.initialize = function initialize(userData, token) {
          this._id = userData.id;
          this._nickname = userData.nickname;
          this.level = userData.level;
          this.experience = userData.exp;
          this.gold = userData.coin;
          this.diamond = userData.diamond;
          this.prosperity = userData.prosperity;
          this.headUrl = userData.avatarUrl;
          this._registerTime = new Date(userData.register_time);
          this._lastLoginTime = new Date(userData.last_login_time);
          this._token = token;

          // 触发更新事件
          this.eventTarget.emit(SharedDefines.EVENT_PLAYER_STATE_INIT, this);
        }

        // Setters with event emission
        ;
        // Methods to modify player attributes
        _proto.addExperience = function addExperience(amount) {
          this.experience += amount;
        };
        _proto.addGold = function addGold(amount) {
          this.gold += amount;
        };
        _proto.addDiamond = function addDiamond(amount) {
          this.diamond += amount;
        };
        _proto.addProsperity = function addProsperity(amount) {
          this.prosperity += amount;
        };
        _proto.spendGold = function spendGold(amount) {
          if (this._gold >= amount) {
            this.gold -= amount;
            return true;
          }
          return false;
        };
        _proto.spendDiamond = function spendDiamond(amount) {
          if (this._diamond >= amount) {
            this.diamond -= amount;
            return true;
          }
          return false;
        };
        _proto.checkLevelUp = function checkLevelUp() {
          console.log("PlayerState: checkLevelUp  level: " + this.level + " experience: " + this.experience);
          var expNeededForNextLevel = this.getExpNeededForNextLevel();
          if (this.experience >= expNeededForNextLevel) {
            this.experience -= expNeededForNextLevel;
            this.level += 1;
            console.log("PlayerState: checkLevelUp  levelup: " + this.level + " experience: " + this.experience);
            this.checkLevelUp(); // prevent too many levels
          }
        };

        _proto.getExpNeededForNextLevel = function getExpNeededForNextLevel() {
          // TEST ONLY
          return Math.floor(100 * Math.pow(1.5, this._level - 1));
        };
        _createClass(PlayerState, [{
          key: "id",
          get:
          // Getters
          function get() {
            return this._id;
          }
        }, {
          key: "nickname",
          get: function get() {
            return this._nickname;
          }
        }, {
          key: "registerTime",
          get: function get() {
            return this._registerTime;
          }
        }, {
          key: "lastLoginTime",
          get: function get() {
            return this._lastLoginTime;
          }
        }, {
          key: "token",
          get: function get() {
            return this._token;
          }
        }, {
          key: "level",
          get: function get() {
            return this._level;
          },
          set: function set(value) {
            if (this._level !== value) {
              console.log("set level: " + value);
              var oldLevel = this._level;
              this._level = value;
              this.eventTarget.emit(SharedDefines.EVENT_PLAYER_LEVEL_UP, {
                oldLevel: oldLevel,
                newLevel: value
              });
            }
          }
        }, {
          key: "experience",
          get: function get() {
            return this._experience;
          },
          set: function set(value) {
            if (this._experience !== value) {
              var oldExp = this._experience;
              this._experience = value;
              this.eventTarget.emit(SharedDefines.EVENT_PLAYER_EXP_CHANGE, {
                oldExp: oldExp,
                newExp: value
              });
              this.checkLevelUp();
            }
          }
        }, {
          key: "gold",
          get: function get() {
            return this._gold;
          },
          set: function set(value) {
            if (this._gold !== value) {
              var oldGold = this._gold;
              this._gold = value;
              this.eventTarget.emit(SharedDefines.EVENT_PLAYER_GOLD_CHANGE, {
                oldGold: oldGold,
                newGold: value
              });
            }
          }
        }, {
          key: "diamond",
          get: function get() {
            return this._diamond;
          },
          set: function set(value) {
            if (this._diamond !== value) {
              var oldDiamond = this._diamond;
              this._diamond = value;
              this.eventTarget.emit(SharedDefines.EVENT_PLAYER_DIAMOND_CHANGE, {
                oldDiamond: oldDiamond,
                newDiamond: value
              });
            }
          }
        }, {
          key: "prosperity",
          get: function get() {
            return this._prosperity;
          },
          set: function set(value) {
            if (this._prosperity !== value) {
              var oldProsperity = this._prosperity;
              this._prosperity = value;
              this.eventTarget.emit(SharedDefines.EVENT_PLAYER_PROSPERITY_CHANGE, {
                oldProsperity: oldProsperity,
                newProsperity: value
              });
            }
          }
        }, {
          key: "headUrl",
          get: function get() {
            return this._headUrl;
          },
          set: function set(value) {
            this._headUrl = value;
          }
        }]);
        return PlayerState;
      }());
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/PlotTile.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './Crop.ts', './SharedDefines.ts', './ResourceManager.ts', './WindowManager.ts', './PlayerController.ts', './CooldownComponent.ts', './NetworkManager.ts', './GameController.ts', './SceneEntity.ts', './UIEffectHelper.ts', './CoinCollectionEffectComponent.ts'], function (exports) {
  var _applyDecoratedDescriptor, _inheritsLoose, _initializerDefineProperty, _assertThisInitialized, _createClass, _asyncToGenerator, _regeneratorRuntime, cclegacy, _decorator, Vec2, EventTarget, PolygonCollider2D, Director, Vec3, instantiate, Crop, SharedDefines, FarmSelectionType, SceneItemType, CommandType, ResourceManager, WindowManager, PlayerController, CooldownComponent, NetworkManager, GameController, SceneEntity, UIEffectHelper, CoinType;
  return {
    setters: [function (module) {
      _applyDecoratedDescriptor = module.applyDecoratedDescriptor;
      _inheritsLoose = module.inheritsLoose;
      _initializerDefineProperty = module.initializerDefineProperty;
      _assertThisInitialized = module.assertThisInitialized;
      _createClass = module.createClass;
      _asyncToGenerator = module.asyncToGenerator;
      _regeneratorRuntime = module.regeneratorRuntime;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      Vec2 = module.Vec2;
      EventTarget = module.EventTarget;
      PolygonCollider2D = module.PolygonCollider2D;
      Director = module.Director;
      Vec3 = module.Vec3;
      instantiate = module.instantiate;
    }, function (module) {
      Crop = module.Crop;
    }, function (module) {
      SharedDefines = module.SharedDefines;
      FarmSelectionType = module.FarmSelectionType;
      SceneItemType = module.SceneItemType;
      CommandType = module.CommandType;
    }, function (module) {
      ResourceManager = module.ResourceManager;
    }, function (module) {
      WindowManager = module.WindowManager;
    }, function (module) {
      PlayerController = module.PlayerController;
    }, function (module) {
      CooldownComponent = module.CooldownComponent;
    }, function (module) {
      NetworkManager = module.NetworkManager;
    }, function (module) {
      GameController = module.GameController;
    }, function (module) {
      SceneEntity = module.SceneEntity;
    }, function (module) {
      UIEffectHelper = module.UIEffectHelper;
    }, function (module) {
      CoinType = module.CoinType;
    }],
    execute: function () {
      var _dec, _dec2, _class, _class2, _descriptor, _descriptor2, _class3;
      cclegacy._RF.push({}, "2c396/vGR1Kgb0Gz80PBWGw", "PlotTile", undefined);
      var ccclass = _decorator.ccclass,
        property = _decorator.property;
      var PlotTile = exports('PlotTile', (_dec = ccclass('PlotTile'), _dec2 = property(Vec2), _dec(_class = (_class2 = (_class3 = /*#__PURE__*/function (_SceneEntity) {
        _inheritsLoose(PlotTile, _SceneEntity);
        function PlotTile() {
          var _this;
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          _this = _SceneEntity.call.apply(_SceneEntity, [this].concat(args)) || this;
          _initializerDefineProperty(_this, "isOccupied", _descriptor, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "gridPosition", _descriptor2, _assertThisInitialized(_this));
          _this.polygonCollider = null;
          _this.cooldownComponent = null;
          _this.gameController = null;
          _this.node = void 0;
          _this.occupiedCrop = null;
          _this.careCooldown = 0;
          _this.currentDraggable = null;
          _this.dragDropComponent = null;
          _this.playerController = null;
          _this.eventTarget = new EventTarget();
          return _this;
        }
        var _proto = PlotTile.prototype;
        _proto.onLoad = function onLoad() {
          this.polygonCollider = this.getComponent(PolygonCollider2D);
          if (!this.polygonCollider) {
            console.error('PlotTile: PolygonCollider2D component is missing!');
          }
          //listening to click event
          //this.node.on(Node.EventType.TOUCH_END, this.onTouchStart, this);
          this.gameController = Director.instance.getScene().getComponentInChildren(GameController);
          if (!this.gameController) {
            console.error('PlotTile: GameController not found!');
          }
          this.cooldownComponent = this.addComponent(CooldownComponent);
        };
        _proto.start = function start() {
          this.playerController = Director.instance.getScene().getComponentInChildren(PlayerController);
          if (!this.playerController) {
            console.error('PlotTile: PlayerController not found!');
          }
        };
        _proto.initialize = function initialize(isPlayerOwner) {
          //console.log(`initialize , name = ${this.node.name} , isPlayerOwner = ${isPlayerOwner}`);
          this.init(this.node.name, isPlayerOwner);
        }

        //ondestroy
        ;

        _proto.onDestroy = function onDestroy() {
          // this.node.off(Node.EventType.TOUCH_END, this.onTouchStart, this);
        };
        _proto.getWorldPosition = function getWorldPosition() {
          var worldPos = this.node.getWorldPosition();
          return new Vec2(worldPos.x, worldPos.y);
        };
        _proto.occupy = function occupy(crop) {
          if (!crop || this.isOccupied) return;
          console.log("occupy crop , name = " + crop.node.name);
          this.occupiedCrop = crop;
          this.node.addChild(crop.node);
          this.isOccupied = true;
          console.log("occupy crop 3, name = " + crop.node.name);
          this.eventTarget.emit(SharedDefines.EVENT_PLOT_OCCUPIED, this);
          crop.eventTarget.on(SharedDefines.EVENT_CROP_HARVEST, this.onCropHarvest, this);
          console.log("occupy crop 4, name = " + crop.node.name);
        };
        _proto.clear = function clear() {
          if (this.occupiedCrop) {
            this.occupiedCrop.eventTarget.off(SharedDefines.EVENT_CROP_HARVEST, this.onCropHarvest, this);
          }
          this.node.removeAllChildren();
          this.occupiedCrop = null;
          this.isOccupied = false;
        };
        _proto.canCare = function canCare() {
          return this.occupiedCrop && this.occupiedCrop.CareCount >= 0 && this.occupiedCrop.CareCount < PlotTile.MAX_CARE_COUNT && !this.cooldownComponent.isOnCooldown(SharedDefines.COOLDOWN_KEY_CARE);
        };
        _proto.canTreat = function canTreat() {
          return this.occupiedCrop && this.occupiedCrop.TreatCount >= 0 && this.occupiedCrop.TreatCount < PlotTile.MAX_TREAT_COUNT && !this.cooldownComponent.isOnCooldown(SharedDefines.COOLDOWN_KEY_TREAT);
        };
        _proto.canCleanse = function canCleanse() {
          return this.occupiedCrop && this.occupiedCrop.CleanseCount >= 0 && this.occupiedCrop.CleanseCount < PlotTile.MAX_CLEANSE_COUNT && !this.cooldownComponent.isOnCooldown(SharedDefines.COOLDOWN_KEY_CLEANSE);
        };
        _proto.getNode = function getNode() {
          return this.node;
        };
        _proto.onTouchStart = function onTouchStart(event) {
          if (this.isOccupied) {
            return;
          }
          this.eventTarget.emit(SharedDefines.EVENT_PLOT_SELECTED, this);
        }

        //#region select
        ;

        _proto.select = function select(dragComponent) {
          var _this2 = this;
          if (this.cooldownComponent.isOnCooldown('select')) {
            return; // if cooldown is on, ignore this select
          }

          console.log("select plot tile , name = " + this.node.name + " , occupied = " + this.isOccupied);
          if (this.isOccupied) {
            if (this.occupiedCrop.canHarvest()) {
              this.occupiedCrop.harvest();
              return;
            } else {
              WindowManager.instance.show(SharedDefines.WINDOW_SELECTION_NAME, FarmSelectionType.PLOT_COMMAND, this.node, this.node.getWorldPosition(), this.onSelectionWindowItemClicked.bind(this));
              console.log('select plot command , name = ' + this.node.name);
            }
          } else {
            this.dragDropComponent = dragComponent;
            WindowManager.instance.show(SharedDefines.WINDOW_SELECTION_NAME, FarmSelectionType.PLOT, this.node, this.node.getWorldPosition(), this.onSelectionWindowItemClicked.bind(this));
            console.log('select plot , name = ' + this.node.name);
          }
          this.cooldownComponent.startCooldown('select', SharedDefines.COOLDOWN_SELECTION_TIME, function () {
            console.log("select cooldown end , name = " + _this2.node.name);
          });
        };
        _proto.onSelectionWindowItemClicked = /*#__PURE__*/function () {
          var _onSelectionWindowItemClicked = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(data) {
            var sceneItem, careResult, treatResult, cleanseResult, immunityDuration, inventoryItem;
            return _regeneratorRuntime().wrap(function _callee$(_context) {
              while (1) switch (_context.prev = _context.next) {
                case 0:
                  console.log("onSelectionWindowItemClicked start...");
                  this.cooldownComponent.startCooldown('select', SharedDefines.COOLDOWN_SELECTION_TIME, function () {});
                  if (!this.isOccupied) {
                    _context.next = 72;
                    break;
                  }
                  sceneItem = this.occupiedCrop.SceneItem;
                  if (!sceneItem) {
                    _context.next = 70;
                    break;
                  }
                  if (!(data == CommandType.Care)) {
                    _context.next = 27;
                    break;
                  }
                  careResult = null;
                  if (!this.playerController.visitMode) {
                    _context.next = 13;
                    break;
                  }
                  _context.next = 10;
                  return NetworkManager.instance.careFriend(sceneItem.id, this.playerController.friendState.id);
                case 10:
                  careResult = _context.sent;
                  _context.next = 16;
                  break;
                case 13:
                  _context.next = 15;
                  return NetworkManager.instance.care(sceneItem.id);
                case 15:
                  careResult = _context.sent;
                case 16:
                  if (!careResult.success) {
                    _context.next = 24;
                    break;
                  }
                  this.occupiedCrop.CareCount = careResult.data.care_count;
                  if (!careResult.data.friend_id) {
                    _context.next = 22;
                    break;
                  }
                  console.log("care friend , name = " + careResult.data.friend_id + " , friend_id = " + this.playerController.friendState.id + " , diamond_added = " + careResult.data.diamond_added);
                  _context.next = 22;
                  return this.playDiamondCollectionEffect(careResult.data.diamond_added);
                case 22:
                  _context.next = 25;
                  break;
                case 24:
                  console.log("Care failed");
                case 25:
                  _context.next = 70;
                  break;
                case 27:
                  if (!(data == CommandType.Treat)) {
                    _context.next = 49;
                    break;
                  }
                  treatResult = null;
                  if (!this.playerController.visitMode) {
                    _context.next = 35;
                    break;
                  }
                  _context.next = 32;
                  return NetworkManager.instance.treatFriend(sceneItem.id, this.playerController.friendState.id);
                case 32:
                  treatResult = _context.sent;
                  _context.next = 38;
                  break;
                case 35:
                  _context.next = 37;
                  return NetworkManager.instance.treat(sceneItem.id);
                case 37:
                  treatResult = _context.sent;
                case 38:
                  if (!treatResult.success) {
                    _context.next = 46;
                    break;
                  }
                  this.occupiedCrop.TreatCount = treatResult.data.treat_count;
                  if (!treatResult.data.friend_id) {
                    _context.next = 44;
                    break;
                  }
                  console.log("treat friend , name = " + treatResult.data.friend_id + " , friend_id = " + this.playerController.friendState.id + " , diamond_added = " + treatResult.data.diamond_added);
                  _context.next = 44;
                  return this.playDiamondCollectionEffect(treatResult.data.diamond_added);
                case 44:
                  _context.next = 47;
                  break;
                case 46:
                  console.log("Treat failed");
                case 47:
                  _context.next = 70;
                  break;
                case 49:
                  if (!(data == CommandType.Cleanse)) {
                    _context.next = 70;
                    break;
                  }
                  cleanseResult = null;
                  if (!this.playerController.visitMode) {
                    _context.next = 57;
                    break;
                  }
                  _context.next = 54;
                  return NetworkManager.instance.cleanseFriend(sceneItem.id, this.playerController.friendState.id);
                case 54:
                  cleanseResult = _context.sent;
                  _context.next = 60;
                  break;
                case 57:
                  _context.next = 59;
                  return NetworkManager.instance.cleanse(sceneItem.id);
                case 59:
                  cleanseResult = _context.sent;
                case 60:
                  if (!cleanseResult.success) {
                    _context.next = 69;
                    break;
                  }
                  // this.occupiedCrop.CleanseCount = cleanseResult.data.cleanse_count;
                  immunityDuration = cleanseResult.data.cleanse_count; // Default to 24 hours if not provided
                  this.occupiedCrop.setImmunityDuration(immunityDuration, new Date());
                  if (!cleanseResult.data.friend_id) {
                    _context.next = 67;
                    break;
                  }
                  console.log("cleanse friend , name = " + cleanseResult.data.friend_id + " , friend_id = " + this.playerController.friendState.id + " , diamond_added = " + cleanseResult.data.diamond_added);
                  _context.next = 67;
                  return this.playDiamondCollectionEffect(cleanseResult.data.diamond_added);
                case 67:
                  _context.next = 70;
                  break;
                case 69:
                  console.log("Cleanse failed");
                case 70:
                  _context.next = 75;
                  break;
                case 72:
                  inventoryItem = data;
                  _context.next = 75;
                  return this.createAndStartDraggingCrop(inventoryItem);
                case 75:
                case "end":
                  return _context.stop();
              }
            }, _callee, this);
          }));
          function onSelectionWindowItemClicked(_x) {
            return _onSelectionWindowItemClicked.apply(this, arguments);
          }
          return onSelectionWindowItemClicked;
        }();
        _proto.createAndStartDraggingCrop = /*#__PURE__*/function () {
          var _createAndStartDraggingCrop = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2(inventoryItem) {
            var cropPrefab, cropNode, crop, gameplayNode;
            return _regeneratorRuntime().wrap(function _callee2$(_context2) {
              while (1) switch (_context2.prev = _context2.next) {
                case 0:
                  _context2.next = 2;
                  return ResourceManager.instance.loadPrefab(SharedDefines.PREFAB_CROP_CORN);
                case 2:
                  cropPrefab = _context2.sent;
                  cropNode = instantiate(cropPrefab);
                  cropNode.name = inventoryItem.detailId;
                  crop = cropNode.getComponent(Crop);
                  crop.initializeWithInventoryItem(inventoryItem);
                  crop.updateSprite("" + SharedDefines.WINDOW_SHOP_TEXTURES + inventoryItem.iconName);
                  gameplayNode = Director.instance.getScene().getChildByPath(SharedDefines.PATH_GAMEPLAY);
                  gameplayNode.addChild(crop.node);
                  //cropNode.setWorldPosition(worldPos);
                  this.dragDropComponent.startDragging(crop, cropNode);
                case 11:
                case "end":
                  return _context2.stop();
              }
            }, _callee2, this);
          }));
          function createAndStartDraggingCrop(_x2) {
            return _createAndStartDraggingCrop.apply(this, arguments);
          }
          return createAndStartDraggingCrop;
        }() //#endregion
        ;

        _proto.isPointInPolygon = function isPointInPolygon(point, polygon) {
          var inside = false;
          for (var i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            var xi = polygon[i].x,
              yi = polygon[i].y;
            var xj = polygon[j].x,
              yj = polygon[j].y;
            var intersect = yi > point.y !== yj > point.y && point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi;
            if (intersect) inside = !inside;
          }
          return inside;
        };
        _proto.getWorldPoints = function getWorldPoints() {
          var worldPos = this.node.getWorldPosition();
          var worldScale = this.node.getWorldScale();
          var angle = this.node.angle;
          return this.polygonCollider.points.map(function (point) {
            // 应用平移
            return new Vec2(point.x + worldPos.x, point.y + worldPos.y);
          });
        };
        _proto.isPointInside = function isPointInside(point) {
          if (this.polygonCollider) {
            var worldPoints = this.getWorldPoints();
            return this.isPointInPolygon(point, worldPoints);
          } else {
            var worldPos = this.node.getWorldPosition();
            var size = this.node.getContentSize();
            var halfWidth = size.width / 2;
            var halfHeight = size.height / 2;
            return point.x >= worldPos.x - halfWidth && point.x <= worldPos.x + halfWidth && point.y >= worldPos.y - halfHeight && point.y <= worldPos.y + halfHeight;
          }
        }

        //#region IDraggable
        ;

        _proto.canAcceptDrop = function canAcceptDrop(draggable) {
          return !this.isOccupied && draggable instanceof Crop;
        };
        _proto.onDrop = function onDrop(draggable) {
          var _this3 = this;
          if (draggable instanceof Crop) {
            console.log('drop crop , name = ' + this.node.name);
            var crop = draggable;
            NetworkManager.instance.eventTarget.once(NetworkManager.EVENT_PLANT, function (result) {
              if (!result.success || _this3.currentDraggable === null) {
                console.log('crop plant failed , name = ' + _this3.node.name);
                return;
              }
              var crop = _this3.currentDraggable;
              crop.initializeWithSceneItem(result.data, _this3.isPlayerOwner);
              _this3.plant(crop);
              _this3.currentDraggable = null;
            });
            var worldPos = this.node.getWorldPosition();
            var worldScale = this.node.getWorldScale();
            //convert world pos to design pos
            var designPos = new Vec2(worldPos.x / worldScale.x, worldPos.y / worldScale.y);
            this.currentDraggable = draggable;
            NetworkManager.instance.plant(crop.id, SceneItemType.Crop, designPos.x, designPos.y, this.node.name);
          }
        };
        _proto.plant = function plant(crop) {
          if (crop.node.parent) {
            crop.node.removeFromParent();
          }
          this.node.addChild(crop.node);
          crop.node.position = Vec3.ZERO;
          console.log("plant crop 1, name = " + crop.node.name);
          this.occupy(crop);
          console.log("plant crop 2, name = " + crop.node.name);
          crop.startGrowing();
          //this.cooldownComponent.startCooldown('select', SharedDefines.COOLDOWN_SELECTION_TIME, () => { });
          NetworkManager.instance.eventTarget.off(NetworkManager.EVENT_PLANT, this.plant);
        };
        _proto.onCropHarvest = function onCropHarvest(crop) {
          console.log('crop harvest , name = ' + this.node.name);
          this.clear();
        }

        //#endregion

        //#region care
        ;

        _proto.onCare = function onCare(careCount) {
          console.log("onCare , name = " + this.node.name + " , careCount = " + careCount + " , isPlayer = " + this.isPlayerOwner);
          this.occupiedCrop.CareCount = careCount;
        }

        //#endregion

        // Add these methods to the PlotTile class
        ;

        _proto.canPerformOperation = function canPerformOperation(operation) {
          if (!this.occupiedCrop) return false;
          switch (operation) {
            case CommandType.Care:
              return this.canCare();
            case CommandType.Treat:
              return this.canTreat();
            case CommandType.Cleanse:
              return this.canCleanse();
            default:
              return false;
          }
        };
        _proto.performOperation = /*#__PURE__*/function () {
          var _performOperation = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee3(operation) {
            var sceneItem, result;
            return _regeneratorRuntime().wrap(function _callee3$(_context3) {
              while (1) switch (_context3.prev = _context3.next) {
                case 0:
                  if (this.occupiedCrop) {
                    _context3.next = 2;
                    break;
                  }
                  return _context3.abrupt("return");
                case 2:
                  sceneItem = this.occupiedCrop.SceneItem;
                  if (sceneItem) {
                    _context3.next = 5;
                    break;
                  }
                  return _context3.abrupt("return");
                case 5:
                  result = null;
                  _context3.t0 = operation;
                  _context3.next = _context3.t0 === CommandType.Care ? 9 : _context3.t0 === CommandType.Treat ? 14 : _context3.t0 === CommandType.Cleanse ? 19 : 24;
                  break;
                case 9:
                  _context3.next = 11;
                  return NetworkManager.instance.care(sceneItem.id);
                case 11:
                  result = _context3.sent;
                  if (result && result.success) {
                    this.occupiedCrop.CareCount = result.data.care_count;
                  }
                  return _context3.abrupt("break", 24);
                case 14:
                  _context3.next = 16;
                  return NetworkManager.instance.treat(sceneItem.id);
                case 16:
                  result = _context3.sent;
                  if (result && result.success) {
                    this.occupiedCrop.TreatCount = result.data.treat_count;
                  }
                  return _context3.abrupt("break", 24);
                case 19:
                  _context3.next = 21;
                  return NetworkManager.instance.cleanse(sceneItem.id);
                case 21:
                  result = _context3.sent;
                  if (result && result.success) {
                    this.occupiedCrop.setImmunityDuration(result.data.cleanse_count, new Date());
                  }
                  return _context3.abrupt("break", 24);
                case 24:
                  if (result && result.success && result.data.friend_id) {
                    console.log("Operation " + operation + " on friend's crop, friend_id = " + result.data.friend_id + ", diamond_added = " + result.data.diamond_added);
                    this.playerController.playerState.addDiamond(result.data.diamond_added);
                    this.playerController.friendState.addDiamond(result.data.diamond_added);
                  }
                case 25:
                case "end":
                  return _context3.stop();
              }
            }, _callee3, this);
          }));
          function performOperation(_x3) {
            return _performOperation.apply(this, arguments);
          }
          return performOperation;
        }();
        _proto.playDiamondCollectionEffect = /*#__PURE__*/function () {
          var _playDiamondCollectionEffect = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee4(diamondAmount) {
            var _this4 = this;
            var gameWindow, diamondDisplay, endPos, coinEffect;
            return _regeneratorRuntime().wrap(function _callee4$(_context4) {
              while (1) switch (_context4.prev = _context4.next) {
                case 0:
                  gameWindow = WindowManager.instance.getWindow(SharedDefines.WINDOW_GAME_NAME);
                  diamondDisplay = gameWindow.diamondDisplay;
                  if (diamondDisplay) {
                    _context4.next = 5;
                    break;
                  }
                  console.error('diamondDisplay not found');
                  return _context4.abrupt("return");
                case 5:
                  endPos = diamondDisplay.currencySpriteNode.getWorldPosition();
                  _context4.next = 8;
                  return UIEffectHelper.playCoinCollectionEffect(CoinType.DIAMOND, this.node, this.node.getWorldPosition(), endPos);
                case 8:
                  coinEffect = _context4.sent;
                  coinEffect.node.on("effectComplete", function () {
                    _this4.playerController.playerState.addDiamond(diamondAmount);
                    _this4.playerController.friendState.addDiamond(diamondAmount);
                  }, coinEffect.node);
                case 10:
                case "end":
                  return _context4.stop();
              }
            }, _callee4, this);
          }));
          function playDiamondCollectionEffect(_x4) {
            return _playDiamondCollectionEffect.apply(this, arguments);
          }
          return playDiamondCollectionEffect;
        }();
        _createClass(PlotTile, [{
          key: "OcuippedCrop",
          get:
          //getter ocuippedCrop
          function get() {
            return this.occupiedCrop;
          }
        }]);
        return PlotTile;
      }(SceneEntity), _class3.MAX_CARE_COUNT = 4, _class3.MAX_TREAT_COUNT = 4, _class3.MAX_CLEANSE_COUNT = 4, _class3.CARE_COOLDOWN = 5 * SharedDefines.TIME_MINUTE, _class3.TREAT_COOLDOWN = 5 * SharedDefines.TIME_MINUTE, _class3.CLEANSE_COOLDOWN = 5 * SharedDefines.TIME_MINUTE, _class3), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "isOccupied", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return false;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "gridPosition", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return new Vec2(0, 0);
        }
      })), _class2)) || _class));
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/ResourceManager.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc'], function (exports) {
  var _createClass, _asyncToGenerator, _regeneratorRuntime, cclegacy, _decorator, resources, Prefab;
  return {
    setters: [function (module) {
      _createClass = module.createClass;
      _asyncToGenerator = module.asyncToGenerator;
      _regeneratorRuntime = module.regeneratorRuntime;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      resources = module.resources;
      Prefab = module.Prefab;
    }],
    execute: function () {
      var _dec, _class, _class2;
      cclegacy._RF.push({}, "6ac05Z/rwBKk5Gxv5aLyc2m", "ResourceManager", undefined);
      var ccclass = _decorator.ccclass,
        property = _decorator.property;
      var ResourceManager = exports('ResourceManager', (_dec = ccclass('ResourceManager'), _dec(_class = (_class2 = /*#__PURE__*/function () {
        function ResourceManager() {
          this.cache = new Map();
        }
        var _proto = ResourceManager.prototype;
        _proto.loadPrefab = /*#__PURE__*/function () {
          var _loadPrefab = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(path) {
            var _this = this;
            var cachedAsset;
            return _regeneratorRuntime().wrap(function _callee$(_context) {
              while (1) switch (_context.prev = _context.next) {
                case 0:
                  cachedAsset = this.cache.get(path);
                  if (!(cachedAsset instanceof Prefab)) {
                    _context.next = 3;
                    break;
                  }
                  return _context.abrupt("return", cachedAsset);
                case 3:
                  return _context.abrupt("return", new Promise(function (resolve) {
                    resources.load(path, Prefab, function (err, prefab) {
                      if (err) {
                        console.error("Failed to load prefab " + path + ":", err);
                        resolve(null);
                      } else {
                        _this.cache.set(path, prefab);
                        resolve(prefab);
                      }
                    });
                  }));
                case 4:
                case "end":
                  return _context.stop();
              }
            }, _callee, this);
          }));
          function loadPrefab(_x) {
            return _loadPrefab.apply(this, arguments);
          }
          return loadPrefab;
        }();
        _proto.loadAsset = /*#__PURE__*/function () {
          var _loadAsset = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2(path, type) {
            var _this2 = this;
            var cachedAsset;
            return _regeneratorRuntime().wrap(function _callee2$(_context2) {
              while (1) switch (_context2.prev = _context2.next) {
                case 0:
                  cachedAsset = this.cache.get(path);
                  if (!(cachedAsset instanceof type)) {
                    _context2.next = 3;
                    break;
                  }
                  return _context2.abrupt("return", cachedAsset);
                case 3:
                  return _context2.abrupt("return", new Promise(function (resolve) {
                    resources.load(path, type, function (err, asset) {
                      if (err) {
                        console.error("Failed to load asset " + path + ":", err);
                        resolve(null);
                      } else {
                        _this2.cache.set(path, asset);
                        resolve(asset);
                      }
                    });
                  }));
                case 4:
                case "end":
                  return _context2.stop();
              }
            }, _callee2, this);
          }));
          function loadAsset(_x2, _x3) {
            return _loadAsset.apply(this, arguments);
          }
          return loadAsset;
        }();
        _proto.releaseAsset = function releaseAsset(path) {
          var asset = this.cache.get(path);
          if (asset) {
            resources.release(path);
            this.cache["delete"](path);
          }
        };
        _proto.clearCache = function clearCache() {
          this.cache.forEach(function (asset, path) {
            resources.release(path);
          });
          this.cache.clear();
        };
        _createClass(ResourceManager, null, [{
          key: "instance",
          get: function get() {
            if (this._instance === null) {
              this._instance = new ResourceManager();
            }
            return this._instance;
          }
        }]);
        return ResourceManager;
      }(), _class2._instance = null, _class2)) || _class));
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/SceneEntity.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc'], function (exports) {
  var _inheritsLoose, _createClass, cclegacy, _decorator, Component;
  return {
    setters: [function (module) {
      _inheritsLoose = module.inheritsLoose;
      _createClass = module.createClass;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      Component = module.Component;
    }],
    execute: function () {
      var _dec, _class;
      cclegacy._RF.push({}, "5fa4d5/lTdAd6OM+kIBGAyR", "SceneEntity", undefined);
      var ccclass = _decorator.ccclass,
        property = _decorator.property;
      var SceneEntity = exports('SceneEntity', (_dec = ccclass('SceneEntity'), _dec(_class = /*#__PURE__*/function (_Component) {
        _inheritsLoose(SceneEntity, _Component);
        function SceneEntity() {
          var _this;
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          _this = _Component.call.apply(_Component, [this].concat(args)) || this;
          _this.id = '';
          _this.isPlayerOwner = false;
          return _this;
        }
        var _proto = SceneEntity.prototype;
        _proto.init = function init(id, isPlayerOwner) {
          this.id = id;
          this.isPlayerOwner = isPlayerOwner;
        };
        _createClass(SceneEntity, [{
          key: "Id",
          get:
          //getters
          function get() {
            return this.id;
          }
        }, {
          key: "IsPlayerOwner",
          get: function get() {
            return this.isPlayerOwner;
          }
        }]);
        return SceneEntity;
      }(Component)) || _class));
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/ScreenOrientationManager.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './SharedDefines.ts', './WindowManager.ts'], function (exports) {
  var _applyDecoratedDescriptor, _inheritsLoose, _initializerDefineProperty, _assertThisInitialized, cclegacy, _decorator, Canvas, Camera, view, Node, UITransform, screen, ResolutionPolicy, Component, SharedDefines, WindowManager;
  return {
    setters: [function (module) {
      _applyDecoratedDescriptor = module.applyDecoratedDescriptor;
      _inheritsLoose = module.inheritsLoose;
      _initializerDefineProperty = module.initializerDefineProperty;
      _assertThisInitialized = module.assertThisInitialized;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      Canvas = module.Canvas;
      Camera = module.Camera;
      view = module.view;
      Node = module.Node;
      UITransform = module.UITransform;
      screen = module.screen;
      ResolutionPolicy = module.ResolutionPolicy;
      Component = module.Component;
    }, function (module) {
      SharedDefines = module.SharedDefines;
    }, function (module) {
      WindowManager = module.WindowManager;
    }],
    execute: function () {
      var _dec, _dec2, _dec3, _class, _class2, _descriptor, _descriptor2;
      cclegacy._RF.push({}, "edc1b3IC6hIxaunsPEb/PoY", "ScreenOrientationManager", undefined);
      var ccclass = _decorator.ccclass,
        property = _decorator.property;
      var ScreenOrientationManager = exports('ScreenOrientationManager', (_dec = ccclass('ScreenOrientationManager'), _dec2 = property(Canvas), _dec3 = property(Camera), _dec(_class = (_class2 = /*#__PURE__*/function (_Component) {
        _inheritsLoose(ScreenOrientationManager, _Component);
        function ScreenOrientationManager() {
          var _this;
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          _this = _Component.call.apply(_Component, [this].concat(args)) || this;
          _initializerDefineProperty(_this, "canvas", _descriptor, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "camera", _descriptor2, _assertThisInitialized(_this));
          _this.isLandscape = false;
          return _this;
        }
        var _proto = ScreenOrientationManager.prototype;
        _proto.start = function start() {
          var _this2 = this;
          // 设置设计分辨率
          var designSize = view.getDesignResolutionSize();
          //view.setDesignResolutionSize(1920, 1080, ResolutionPolicy.FIXED_WIDTH);

          // 初始化屏幕方向
          // this.updateOrientation();
          this.updateScreenSize();

          // 监听屏幕大小变化事件
          //view.on('canvas-resize', this.onScreenResize, this);

          this.canvas.node.on(Node.EventType.SIZE_CHANGED, function () {
            //get uicontent size    
            var uiTransform = _this2.canvas.getComponent(UITransform);
            if (uiTransform) {
              console.log("canvas size changed y pos = " + uiTransform.contentSize.y);
              //update camera ortho height
              _this2.camera.orthoHeight = uiTransform.contentSize.y / 2;
            }
          }, this);
          screen.on('window-resize', function (width, height) {
            return _this2.updateScreenSize();
          }, this);
        };
        _proto.onDestroy = function onDestroy() {
          // 移除监听器
          //view.off('canvas-resize', this.onScreenResize, this);
          screen.off('window-resize', this.updateScreenSize, this);
        };
        _proto.onScreenResize = function onScreenResize() {
          //this.updateOrientation();
          this.updateScreenSize();
        };
        _proto.updateScreenSize = function updateScreenSize() {
          console.log("updateScreenSize");
          // 当前屏幕分辨率比例
          var screenRatio = screen.windowSize.width / screen.windowSize.height;
          // 设计稿分辨率比例
          var designRatio = SharedDefines.DESIGN_RESOLUTION_WIDTH / SharedDefines.DESIGN_RESOLUTION_HEIGHT;
          if (screenRatio <= 1) {
            console.log("竖屏");
            // 屏幕高度大于或等于宽度，即竖屏
            if (screenRatio <= designRatio) {
              this.updateFitWidth();
            } else {
              // 此时屏幕比例大于设计比例
              // 为了保证纵向的游戏内容不受影响，应该使用 fitHeight 模式
              this.updateFitHeight();
            }
          } else {
            console.log("横屏");
            // 屏幕宽度大于高度，即横屏
            this.updateFitHeight();
          }
        }

        //竖屏
        ;

        _proto.updateFitWidth = function updateFitWidth() {
          view.setDesignResolutionSize(SharedDefines.DESIGN_RESOLUTION_HEIGHT, SharedDefines.DESIGN_RESOLUTION_WIDTH, ResolutionPolicy.FIXED_WIDTH);
          //view.setResolutionPolicy(ResolutionPolicy.FIXED_WIDTH);
          this.isLandscape = false;
          this.switchCanvas();
        }

        //横屏
        ;

        _proto.updateFitHeight = function updateFitHeight() {
          view.setDesignResolutionSize(SharedDefines.DESIGN_RESOLUTION_WIDTH, SharedDefines.DESIGN_RESOLUTION_HEIGHT, ResolutionPolicy.FIXED_HEIGHT);
          //view.setResolutionPolicy(ResolutionPolicy.FIXED_HEIGHT);
          this.isLandscape = true;
          this.switchCanvas();
        };
        _proto.updateOrientation = function updateOrientation() {
          var winSize = view.getVisibleSize();
          var newIsLandscape = winSize.width > winSize.height;
          if (this.isLandscape !== newIsLandscape) {
            this.isLandscape = newIsLandscape;
            this.switchCanvas();
          }
        };
        _proto.switchCanvas = function switchCanvas() {
          // if (this.isLandscape) {
          //     this.adjustCanvasSize(this.canvas!, SharedDefines.DESIGN_RESOLUTION_WIDTH, SharedDefines.DESIGN_RESOLUTION_HEIGHT);
          //     this.camera.orthoHeight = SharedDefines.DESIGN_RESOLUTION_HEIGHT / 2;
          // } else {
          //     this.adjustCanvasSize(this.canvas!, SharedDefines.DESIGN_RESOLUTION_HEIGHT, SharedDefines.DESIGN_RESOLUTION_WIDTH);
          //     this.camera.orthoHeight = SharedDefines.DESIGN_RESOLUTION_WIDTH / 2;
          // }

          WindowManager.instance.changeWindowOrientation(this.isLandscape);
        };
        _proto.adjustCanvasSize = function adjustCanvasSize(canvas, width, height) {
          var uiTransform = canvas.getComponent(UITransform);
          if (uiTransform) {
            console.log("adjustCanvasSize", width, height);
            //uiTransform.setContentSize(width, height);
          }
        };

        return ScreenOrientationManager;
      }(Component), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "canvas", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "camera", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      })), _class2)) || _class));
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/ScrollViewItem.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc'], function (exports) {
  var _inheritsLoose, cclegacy, _decorator, Component;
  return {
    setters: [function (module) {
      _inheritsLoose = module.inheritsLoose;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      Component = module.Component;
    }],
    execute: function () {
      var _dec, _class;
      cclegacy._RF.push({}, "e236dr8Cq1EAqC05lcYb4tf", "ScrollViewItem", undefined);
      var ccclass = _decorator.ccclass,
        property = _decorator.property;
      var ScrollViewItem = exports('ScrollViewItem', (_dec = ccclass('ScrollViewItem'), _dec(_class = /*#__PURE__*/function (_Component) {
        _inheritsLoose(ScrollViewItem, _Component);
        function ScrollViewItem() {
          return _Component.apply(this, arguments) || this;
        }
        var _proto = ScrollViewItem.prototype;
        _proto.setScale = function setScale(scale) {
          this.node.setScale(scale);
        };
        return ScrollViewItem;
      }(Component)) || _class));
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/SharedDefines.ts", ['cc'], function (exports) {
  var cclegacy;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
    }],
    execute: function () {
      cclegacy._RF.push({}, "8af2aQ0ArlEeK7Dl0RcVyib", "SharedDefines", undefined);
      var InteractionMode = exports('InteractionMode', /*#__PURE__*/function (InteractionMode) {
        InteractionMode[InteractionMode["CameraDrag"] = 0] = "CameraDrag";
        InteractionMode[InteractionMode["BuildingPlacement"] = 1] = "BuildingPlacement";
        InteractionMode[InteractionMode["Command"] = 2] = "Command";
        InteractionMode[InteractionMode["Plant"] = 3] = "Plant";
        return InteractionMode;
      }({}));
      var CropType = exports('CropType', /*#__PURE__*/function (CropType) {
        CropType[CropType["WHEAT"] = 1] = "WHEAT";
        CropType[CropType["CABBAGE"] = 2] = "CABBAGE";
        CropType[CropType["CARROT"] = 3] = "CARROT";
        CropType[CropType["TOMATO"] = 4] = "TOMATO";
        CropType[CropType["CORN"] = 5] = "CORN";
        CropType[CropType["POTATO"] = 6] = "POTATO";
        CropType[CropType["STRAWBERRY"] = 7] = "STRAWBERRY";
        CropType[CropType["PUMPKIN"] = 8] = "PUMPKIN";
        CropType[CropType["GRAPE"] = 9] = "GRAPE";
        return CropType;
      }({}));
      var GrowState = exports('GrowState', /*#__PURE__*/function (GrowState) {
        GrowState[GrowState["NONE"] = 0] = "NONE";
        GrowState[GrowState["GROWING"] = 1] = "GROWING";
        GrowState[GrowState["HARVESTING"] = 2] = "HARVESTING";
        return GrowState;
      }({}));
      var FarmSelectionType = exports('FarmSelectionType', /*#__PURE__*/function (FarmSelectionType) {
        FarmSelectionType[FarmSelectionType["NONE"] = 0] = "NONE";
        FarmSelectionType[FarmSelectionType["BUILDING"] = 1] = "BUILDING";
        FarmSelectionType[FarmSelectionType["PLOT"] = 2] = "PLOT";
        FarmSelectionType[FarmSelectionType["PLOT_COMMAND"] = 3] = "PLOT_COMMAND";
        FarmSelectionType[FarmSelectionType["FENCE"] = 4] = "FENCE";
        FarmSelectionType[FarmSelectionType["ANIMAL_COMMAND"] = 5] = "ANIMAL_COMMAND";
        return FarmSelectionType;
      }({}));
      var SceneItemType = exports('SceneItemType', /*#__PURE__*/function (SceneItemType) {
        SceneItemType[SceneItemType["None"] = 0] = "None";
        SceneItemType[SceneItemType["Crop"] = 1] = "Crop";
        SceneItemType[SceneItemType["Animal"] = 2] = "Animal";
        SceneItemType[SceneItemType["Building"] = 3] = "Building";
        return SceneItemType;
      }({}));
      var BuildingType = exports('BuildingType', /*#__PURE__*/function (BuildingType) {
        BuildingType[BuildingType["None"] = 0] = "None";
        BuildingType[BuildingType["Factory"] = 1] = "Factory";
        BuildingType[BuildingType["Decoration"] = 2] = "Decoration";
        return BuildingType;
      }({}));
      var SceneItemState = exports('SceneItemState', /*#__PURE__*/function (SceneItemState) {
        SceneItemState[SceneItemState["None"] = 0] = "None";
        SceneItemState[SceneItemState["InProgress"] = 1] = "InProgress";
        SceneItemState[SceneItemState["Complete"] = 2] = "Complete";
        SceneItemState[SceneItemState["Dead"] = 3] = "Dead";
        return SceneItemState;
      }({}));
      var CommandType = exports('CommandType', /*#__PURE__*/function (CommandType) {
        CommandType[CommandType["None"] = 0] = "None";
        CommandType[CommandType["Care"] = 1] = "Care";
        CommandType[CommandType["Treat"] = 2] = "Treat";
        CommandType[CommandType["Cleanse"] = 3] = "Cleanse";
        CommandType[CommandType["Disease"] = 4] = "Disease";
        return CommandType;
      }({})); //生病
      var CommandState = exports('CommandState', /*#__PURE__*/function (CommandState) {
        CommandState[CommandState["None"] = 0] = "None";
        CommandState[CommandState["InProgress"] = 1] = "InProgress";
        CommandState[CommandState["Complete"] = 2] = "Complete";
        return CommandState;
      }({}));
      var GameState = exports('GameState', /*#__PURE__*/function (GameState) {
        GameState["LOADING"] = "loading";
        GameState["MAIN_MENU"] = "main_menu";
        GameState["PLAYING"] = "playing";
        GameState["PAUSED"] = "paused";
        GameState["GAME_OVER"] = "game_over";
        return GameState;
      }({}));
      var DiseaseState = exports('DiseaseState', /*#__PURE__*/function (DiseaseState) {
        DiseaseState[DiseaseState["None"] = 0] = "None";
        DiseaseState[DiseaseState["Disease"] = 1] = "Disease";
        return DiseaseState;
      }({}));
      var SyntheState = exports('SyntheState', /*#__PURE__*/function (SyntheState) {
        SyntheState[SyntheState["None"] = 0] = "None";
        SyntheState[SyntheState["InProgress"] = 1] = "InProgress";
        SyntheState[SyntheState["Complete"] = 2] = "Complete";
        return SyntheState;
      }({}));
      var NetworkLoginResult = exports('NetworkLoginResult', function NetworkLoginResult() {
        this.success = void 0;
        this.message = void 0;
        this.sessionToken = void 0;
        this.user = void 0;
      });
      var NetworkUser = exports('NetworkUser', function NetworkUser() {
        this.id = void 0;
        this.nickname = void 0;
        this.level = void 0;
        this.exp = void 0;
        this.coin = void 0;
        this.diamond = void 0;
        this.register_time = void 0;
        this.last_login_time = void 0;
        this.inventory_items = void 0;
      });
      var NetworkInventoryItem = exports('NetworkInventoryItem', function NetworkInventoryItem() {
        this.id = void 0;
        this.num = void 0;
        this.type = void 0;
        this.item_id = void 0;
      });
      var NetworkHarvestResultData = exports('NetworkHarvestResultData', function NetworkHarvestResultData() {
        this.userid = void 0;
        this.item_id = void 0;
        this.exp_gained = void 0;
        this.new_exp = void 0;
        this.new_level = void 0;
        this.current_coin = void 0;
      });
      var NetworkHarvestResult = exports('NetworkHarvestResult', function NetworkHarvestResult() {
        this.success = void 0;
        this.message = void 0;
        this.data = void 0;
      });
      var NetworkBuyItemResultData = exports('NetworkBuyItemResultData', function NetworkBuyItemResultData() {
        this.item_id = void 0;
        this.current_coin = void 0;
        this.num = void 0;
      });
      var NetworkBuyItemResult = exports('NetworkBuyItemResult', function NetworkBuyItemResult() {
        this.success = void 0;
        this.message = void 0;
        this.data = void 0;
      });
      var NetworkSellItemResultData = exports('NetworkSellItemResultData', function NetworkSellItemResultData() {
        this.item_id = void 0;
        this.current_coin = void 0;
        this.num = void 0;
      });
      var NetworkSellItemResult = exports('NetworkSellItemResult', function NetworkSellItemResult() {
        this.success = void 0;
        this.message = void 0;
        this.data = void 0;
      });
      var NetworkCareResultData = exports('NetworkCareResultData', function NetworkCareResultData() {
        this.sceneid = void 0;
        this.scene_item_type = void 0;
        this.command_id = void 0;
        this.care_count = void 0;
        this.friend_id = void 0;
        this.diamond_added = void 0;
      });
      var NetworkCareResult = exports('NetworkCareResult', function NetworkCareResult() {
        this.success = void 0;
        this.message = void 0;
        this.data = void 0;
      });
      var NetworkTreatResultData = exports('NetworkTreatResultData', function NetworkTreatResultData() {
        this.sceneid = void 0;
        this.command_id = void 0;
        this.treat_count = void 0;
        this.friend_id = void 0;
        this.diamond_added = void 0;
      });
      var NetworkTreatResult = exports('NetworkTreatResult', function NetworkTreatResult() {
        this.success = void 0;
        this.message = void 0;
        this.data = void 0;
      });
      var NetworkCleanseResultData = exports('NetworkCleanseResultData', function NetworkCleanseResultData() {
        this.sceneid = void 0;
        this.command_id = void 0;
        this.cleanse_count = void 0;
        this.friend_id = void 0;
        this.diamond_added = void 0;
      });
      var NetworkCleanseResult = exports('NetworkCleanseResult', function NetworkCleanseResult() {
        this.success = void 0;
        this.message = void 0;
        this.data = void 0;
      });
      var NetworkDiseaseStatusResult = exports('NetworkDiseaseStatusResult', function NetworkDiseaseStatusResult() {
        this.success = void 0;
        this.message = void 0;
        this.is_sick = void 0;
        this.count = void 0;
        this.last_updated_time = void 0;
      });
      var NetworkSyntheListResult = exports('NetworkSyntheListResult', function NetworkSyntheListResult() {
        this.success = void 0;
        this.message = void 0;
        this.data = void 0;
      });
      var NetworkSyntheResultData = exports('NetworkSyntheResultData', function NetworkSyntheResultData() {
        this.id = void 0;
        this.sceneid = void 0;
        this.syntheid = void 0;
        this.startTime = void 0;
        this.endTime = void 0;
        this.count = void 0;
        this.state = void 0;
      });
      var NetworkSyntheResult = exports('NetworkSyntheResult', function NetworkSyntheResult() {
        this.success = void 0;
        this.message = void 0;
        this.data = void 0;
      });
      var NetworkVisitResultData = exports('NetworkVisitResultData', function NetworkVisitResultData() {
        this.userId = void 0;
        this.level = void 0;
        this.exp = void 0;
        this.coin = void 0;
        this.diamond = void 0;
        this.sceneItems = void 0;
      });
      var NetworkVisitResult = exports('NetworkVisitResult', function NetworkVisitResult() {
        this.success = void 0;
        this.message = void 0;
        this.data = void 0;
      });
      var NetworkCommand = exports('NetworkCommand', function NetworkCommand() {
        this.id = void 0;
        this.userid = void 0;
        this.customid = void 0;
        this.state = void 0;
        this.last_updated_time = void 0;
        this.type = void 0;
        this.sceneid = void 0;
        this.count = void 0;
      });
      var NetworkAddBuildingResult = exports('NetworkAddBuildingResult', function NetworkAddBuildingResult() {
        this.success = void 0;
        this.message = void 0;
        this.data = void 0;
      });
      var NetworkAddBuildingResultData = exports('NetworkAddBuildingResultData', function NetworkAddBuildingResultData() {
        this.sceneItem = void 0;
        this.coin = void 0;
        this.diamond = void 0;
        this.prosperity = void 0;
      });
      var NetworkRecommendFriendsResult = exports('NetworkRecommendFriendsResult', function NetworkRecommendFriendsResult() {
        this.success = void 0;
        this.message = void 0;
        this.data = void 0;
      });
      var NetworkRecommendFriendsResultData = exports('NetworkRecommendFriendsResultData', function NetworkRecommendFriendsResultData() {
        this.id = void 0;
        this.nickname = void 0;
        this.level = void 0;
        this.avatarUrl = void 0;
      });
      var NetworkQueryPaymentResult = exports('NetworkQueryPaymentResult', function NetworkQueryPaymentResult() {
        this.success = void 0;
        this.message = void 0;
        this.data = void 0;
      });
      var NetworkQueryPaymentResultData = exports('NetworkQueryPaymentResultData', function NetworkQueryPaymentResultData() {
        this.type = void 0;
        this.amount = void 0;
      });
      var SceneItem = exports('SceneItem', function SceneItem() {
        this.id = void 0;
        this.item_id = void 0;
        this.type = void 0;
        this.x = void 0;
        this.y = void 0;
        this.state = void 0;
        this.userid = void 0;
        this.parent_node_name = void 0;
        this.last_updated_time = void 0;
        this.elapsed_time = void 0;
        this.commands = void 0;
      });
      var SharedDefines = exports('SharedDefines', function SharedDefines() {});
      // // 作物相关
      // public static readonly MAX_CROP_LEVEL: number = 5;
      // public static readonly INITIAL_CROP_PRICE: number = 100;
      // public static readonly CROP_PRICE_INCREASE_RATE: number = 1.5;
      // public static readonly CROP_YIELD_INCREASE_RATE: number = 1.2;
      // // 时间相关（单位：秒）
      // public static readonly DEFAULT_YIELD_INTERVAL: number = 60;
      // public static readonly DEFAULT_GROWTH_TIME: number = 300;
      // public static readonly DEFAULT_HARVEST_TIME: number = 10;
      // // 经济相关
      // public static readonly INITIAL_PLAYER_MONEY: number = 1000;
      // // UI相关
      // public static readonly FADE_DURATION: number = 0.5;
      // // 游戏平衡相关
      // public static readonly XP_PER_HARVEST: number = 10;
      // public static readonly XP_TO_LEVEL_UP: number = 100;
      // // 资源路径
      // public static readonly CROP_SPRITE_PATH: string = 'textures/crops/';
      // // 存储相关
      // public static readonly SAVE_KEY: string = 'farm_game_save';
      // // 音频相关
      // public static readonly BACKGROUND_MUSIC_VOLUME: number = 0.5;
      // public static readonly SFX_VOLUME: number = 1.0;
      SharedDefines.CURRENT_USER_ID = '123';
      SharedDefines.DESIGN_RESOLUTION_WIDTH = 1920;
      SharedDefines.DESIGN_RESOLUTION_HEIGHT = 1080;
      SharedDefines.CARE_TIME_RATIO_REDUCE = 0.05;
      //浇水/喂养冷却时间减少比例
      SharedDefines.TREAT_TIME_RATIO_REDUCE = 0.1;
      //施肥/安抚冷却时间减少比例
      //作物相关
      SharedDefines.MAX_CROP_CARE_COUNT = 4;
      SharedDefines.MAX_CROP_TREAT_COUNT = 4;
      SharedDefines.MAX_CROP_CLEANSE_COUNT = 4;
      //动物相关
      SharedDefines.MAX_ANIMAL_CARE_COUNT = 2;
      SharedDefines.MAX_ANIMAL_TREAT_COUNT = 2;
      SharedDefines.MAX_ANIMAL_CLEANSE_COUNT = 2;
      //冷却时间
      SharedDefines.CARE_COOLDOWN = 5 * 60;
      SharedDefines.TREAT_COOLDOWN = 5 * 60;
      SharedDefines.CLEANSE_COOLDOWN = 5 * 60;
      SharedDefines.DISEASE_STATUS_UPDATE_INTERVAL = 60 * 60;
      //每小时更新一次生病状态
      SharedDefines.TIME_MINUTE = 60;
      SharedDefines.INIT_PLOT_NUM = 5;
      SharedDefines.COOLDOWN_SELECTION_TIME = 0.5;
      SharedDefines.COOLDOWN_KEY_CARE = 'care';
      SharedDefines.COOLDOWN_KEY_TREAT = 'treat';
      SharedDefines.COOLDOWN_KEY_CLEANSE = 'cleanse';
      SharedDefines.EVENT_ORIENTATION_CHANGED = 'orientation-changed';
      SharedDefines.EVENT_TOUCH_START = 'touch-start';
      SharedDefines.EVENT_TOUCH_MOVE = 'touch-move';
      SharedDefines.EVENT_TOUCH_END = 'touch-end';
      SharedDefines.EVENT_TOUCH_CANCEL = 'touch-cancel';
      SharedDefines.EVENT_CLICK = 'click';
      SharedDefines.PATH_CAMERA = 'Canvas/Camera';
      SharedDefines.PATH_GAMEPLAY_CANVAS = 'GameplayCanvas';
      SharedDefines.PATH_GAMEPLAY = 'GameplayCanvas/Gameplay';
      SharedDefines.PATH_INPUT_NODE = 'GameplayCanvas/InputNode';
      SharedDefines.PATH_BUILDINGS = 'GameplayCanvas/Gameplay/Buildings';
      SharedDefines.EVENT_PLOT_SELECTED = 'plotSelected';
      SharedDefines.EVENT_PLOT_OCCUPIED = 'plotOccupied';
      SharedDefines.EVENT_FENCE_ANIMAL_ADDED = 'fence-animal-added';
      SharedDefines.EVENT_PLAYER_LEVEL_UP = 'player-level-up';
      SharedDefines.EVENT_PLAYER_EXP_CHANGE = 'player-exp-change';
      SharedDefines.EVENT_PLAYER_GOLD_CHANGE = 'player-gold-change';
      SharedDefines.EVENT_PLAYER_DIAMOND_CHANGE = 'player-diamond-change';
      SharedDefines.EVENT_PLAYER_PROSPERITY_CHANGE = 'player-prosperity-change';
      SharedDefines.EVENT_PLAYER_PLACEMENT_BUILDING = 'player-placement-building';
      SharedDefines.EVENT_PLAYER_STATE_INIT = 'player-state-init';
      SharedDefines.EVENT_VISIT_MODE_CHANGE = 'visit-mode-change';
      SharedDefines.EVENT_CROP_HARVEST = 'crop-harvest';
      SharedDefines.EVENT_ANIMAL_HARVEST = 'animal-harvest';
      SharedDefines.WINDOW_CRAFT_NAME = 'CraftWindow';
      SharedDefines.WINDOW_SHOP_NAME = 'ShopWindow';
      SharedDefines.WINDOW_SELECTION_NAME = 'FarmSelectionWindow';
      SharedDefines.WINDOW_FARM_FACTORY_NAME = 'FarmFactoryWindow';
      SharedDefines.WINDOW_GAME_NAME = 'GameWindow';
      SharedDefines.WINDOW_TOAST_NAME = "ToastWindow";
      SharedDefines.WINDOW_CRAFT_TEXTURES = 'textures/craftWindow/';
      SharedDefines.WINDOW_BUILDING_TEXTURES = 'textures/buildings/';
      SharedDefines.WINDOW_GAME_TEXTURES = 'textures/gameWindow/';
      SharedDefines.WINDOW_SHOP_TEXTURES = 'textures/shopWindow/';
      SharedDefines.CROPS_TEXTURES = 'textures/crops/';
      SharedDefines.ANIMALS_TEXTURES = 'textures/animals/';
      SharedDefines.LAYER_GROUND_NAME = 'Ground';
      SharedDefines.LAYER_BUILDING_NAME = 'Building';
      SharedDefines.LAYER_OBSTACLE_NAME = 'Obstacle';
      SharedDefines.LAYER_FENCE_NAME = 'Fence';
      SharedDefines.LAYER_PLOTTILE_NAME = 'PlotTile';
      SharedDefines.CROP_GROWTH_STAGES = 4;
      SharedDefines.CROP_GROWTH_TIME = 10;
      SharedDefines.JSON_CROP_DATA = 'data/CropsData';
      SharedDefines.JSON_ITEM_DATA = 'data/ItemData';
      SharedDefines.JSON_BUILD_DATA = 'data/BuildData';
      SharedDefines.JSON_ANIMAL_DATA = 'data/AnimalData';
      SharedDefines.JSON_SYNTHE_DATA = 'data/SyntheData';
      SharedDefines.JSON_GRADE_DATA = 'data/GradeData';
      SharedDefines.PREFAB_CROP_CORN = 'entities/crops/Corn';
      SharedDefines.PREFAB_CROP_CARROT = 'entities/crops/Carrot';
      SharedDefines.PREFAB_CROP_GRAPE = 'entities/crops/Grape';
      SharedDefines.PREFAB_CROP_CABBAGE = 'entities/crops/Cabbage';
      SharedDefines.PREFAB_ANIMAL = 'entities/animal/Animal';
      SharedDefines.PREFAB_COIN_COLLECTION_EFFECT = 'ui/effects/CoinCollectEffect';
      SharedDefines.PREFAB_PLACEMENT_BUILDING = 'entities/buildings/placementBuilding';
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/ShopWindow.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './WindowBase.ts', './InventoryComponent.ts', './ItemDataManager.ts', './ResourceManager.ts', './SharedDefines.ts', './CoinDisplay.ts', './DiamondDisplay.ts', './WindowManager.ts', './NetworkManager.ts', './CoinCollectionEffectComponent.ts', './UIEffectHelper.ts'], function (exports) {
  var _applyDecoratedDescriptor, _inheritsLoose, _initializerDefineProperty, _assertThisInitialized, _asyncToGenerator, _regeneratorRuntime, cclegacy, _decorator, Node, ScrollView, Prefab, Button, Label, Color, Tween, Vec3, Sprite, instantiate, SpriteFrame, WindowBase, InventoryComponent, InventoryItem, ItemDataManager, ResourceManager, SharedDefines, CoinDisplay, DiamondDisplay, WindowManager, NetworkManager, CoinType, UIEffectHelper;
  return {
    setters: [function (module) {
      _applyDecoratedDescriptor = module.applyDecoratedDescriptor;
      _inheritsLoose = module.inheritsLoose;
      _initializerDefineProperty = module.initializerDefineProperty;
      _assertThisInitialized = module.assertThisInitialized;
      _asyncToGenerator = module.asyncToGenerator;
      _regeneratorRuntime = module.regeneratorRuntime;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      Node = module.Node;
      ScrollView = module.ScrollView;
      Prefab = module.Prefab;
      Button = module.Button;
      Label = module.Label;
      Color = module.Color;
      Tween = module.Tween;
      Vec3 = module.Vec3;
      Sprite = module.Sprite;
      instantiate = module.instantiate;
      SpriteFrame = module.SpriteFrame;
    }, function (module) {
      WindowBase = module.WindowBase;
    }, function (module) {
      InventoryComponent = module.InventoryComponent;
      InventoryItem = module.InventoryItem;
    }, function (module) {
      ItemDataManager = module.ItemDataManager;
    }, function (module) {
      ResourceManager = module.ResourceManager;
    }, function (module) {
      SharedDefines = module.SharedDefines;
    }, function (module) {
      CoinDisplay = module.CoinDisplay;
    }, function (module) {
      DiamondDisplay = module.DiamondDisplay;
    }, function (module) {
      WindowManager = module.WindowManager;
    }, function (module) {
      NetworkManager = module.NetworkManager;
    }, function (module) {
      CoinType = module.CoinType;
    }, function (module) {
      UIEffectHelper = module.UIEffectHelper;
    }],
    execute: function () {
      var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor10;
      cclegacy._RF.push({}, "5d315L1iLpPEJcwuY05Lr5R", "ShopWindow", undefined);
      var ccclass = _decorator.ccclass,
        property = _decorator.property;
      var ShopMode = /*#__PURE__*/function (ShopMode) {
        ShopMode[ShopMode["BUY"] = 0] = "BUY";
        ShopMode[ShopMode["SELL"] = 1] = "SELL";
        return ShopMode;
      }(ShopMode || {});
      var ShopWindow = exports('ShopWindow', (_dec = ccclass('ShopWindow'), _dec2 = property(Node), _dec3 = property(Node), _dec4 = property(ScrollView), _dec5 = property(ScrollView), _dec6 = property(Prefab), _dec7 = property(CoinDisplay), _dec8 = property(DiamondDisplay), _dec9 = property(Button), _dec10 = property(Button), _dec11 = property(Button), _dec(_class = (_class2 = /*#__PURE__*/function (_WindowBase) {
        _inheritsLoose(ShopWindow, _WindowBase);
        function ShopWindow() {
          var _this;
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          _this = _WindowBase.call.apply(_WindowBase, [this].concat(args)) || this;
          _initializerDefineProperty(_this, "purchaseNode", _descriptor, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "sellNode", _descriptor2, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "purchaseScrollView", _descriptor3, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "sellScrollView", _descriptor4, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "itemPrefab", _descriptor5, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "coinDisplay", _descriptor6, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "diamondDisplay", _descriptor7, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "buyButton", _descriptor8, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "sellButton", _descriptor9, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "closeButton", _descriptor10, _assertThisInitialized(_this));
          _this.playerController = null;
          _this.inventoryComponent = null;
          _this.currentMode = ShopMode.BUY;
          _this.purchaseItemPool = [];
          _this.sellItemPool = [];
          return _this;
        }
        var _proto = ShopWindow.prototype;
        _proto.initialize = function initialize() {
          _WindowBase.prototype.initialize.call(this);
          this.initializeComponents();
          this.setupEventListeners();
          this.showBuyItems();
        };
        _proto.show = function show() {
          var _WindowBase$prototype;
          for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            args[_key2] = arguments[_key2];
          }
          (_WindowBase$prototype = _WindowBase.prototype.show).call.apply(_WindowBase$prototype, [this].concat(args));
          this.setupNetworkEventListeners();
          this.switchToMode(this.currentMode);
          if (this.coinDisplay) {
            this.coinDisplay.refreshDisplay();
          }
          if (this.diamondDisplay) {
            this.diamondDisplay.refreshDisplay();
          }
          if (this.currentMode === ShopMode.BUY) {
            this.showBuyItems();
          } else {
            this.showSellItems();
          }
        };
        _proto.hide = function hide() {
          _WindowBase.prototype.hide.call(this);
          NetworkManager.instance.eventTarget.off(NetworkManager.EVENT_BUY_ITEM, this.onBuyItemResult, this);
        };
        _proto.initializeComponents = function initializeComponents() {
          if (this.gameController) {
            var _this$playerControlle;
            this.playerController = this.gameController.getPlayerController();
            this.inventoryComponent = (_this$playerControlle = this.playerController) == null ? void 0 : _this$playerControlle.getComponent(InventoryComponent);
            if (this.coinDisplay) {
              this.coinDisplay.initialize(this.playerController.playerState);
            }
            if (this.diamondDisplay) {
              this.diamondDisplay.initialize(this.playerController.playerState);
            }
          }
        };
        _proto.setupEventListeners = function setupEventListeners() {
          var _this$buyButton, _this$sellButton, _this$closeButton;
          (_this$buyButton = this.buyButton) == null || _this$buyButton.node.on(Button.EventType.CLICK, this.onBuyButtonClicked, this);
          (_this$sellButton = this.sellButton) == null || _this$sellButton.node.on(Button.EventType.CLICK, this.onSellButtonClicked, this);
          (_this$closeButton = this.closeButton) == null || _this$closeButton.node.on(Button.EventType.CLICK, this.hide, this);
        };
        _proto.setupNetworkEventListeners = function setupNetworkEventListeners() {
          NetworkManager.instance.eventTarget.on(NetworkManager.EVENT_BUY_ITEM, this.onBuyItemResult, this);
        };
        _proto.onBuyItemResult = function onBuyItemResult(buyItemResult) {
          console.log('onBuyItemResult', buyItemResult);
          if (buyItemResult.success) {
            var item = ItemDataManager.instance.getItemById(buyItemResult.data.item_id);
            if (item) {
              var _this$inventoryCompon;
              this.playerController.playerState.gold = buyItemResult.data.current_coin;
              var inventoryItem = new InventoryItem(item);
              (_this$inventoryCompon = this.inventoryComponent) == null || _this$inventoryCompon.addItem(inventoryItem);
              console.log("Bought item: " + item.name);
              this.showBuyItems();
            }
          }
        };
        _proto.onBuyButtonClicked = function onBuyButtonClicked() {
          this.animateButton(this.buyButton.node);
          this.currentMode = ShopMode.BUY;
          this.switchToMode(ShopMode.BUY);
          this.showBuyItems();
        };
        _proto.onSellButtonClicked = function onSellButtonClicked() {
          this.animateButton(this.sellButton.node);
          this.currentMode = ShopMode.SELL;
          this.switchToMode(ShopMode.SELL);
          this.showSellItems();
        };
        _proto.onBtnCloseClicked = function onBtnCloseClicked() {
          WindowManager.instance.hide(SharedDefines.WINDOW_SHOP_NAME);
        };
        _proto.switchToMode = function switchToMode(mode) {
          this.purchaseNode.active = mode === ShopMode.BUY;
          this.sellNode.active = mode === ShopMode.SELL;
          var lbBuy = this.buyButton.node.getComponentInChildren(Label);
          var lbSell = this.sellButton.node.getComponentInChildren(Label);
          if (mode === ShopMode.BUY) {
            lbBuy.color = Color.fromHEX(new Color(), "#88563F");
            lbSell.color = Color.fromHEX(new Color(), "#C4A47E");
          } else {
            lbSell.color = Color.fromHEX(new Color(), "#88563F");
            lbBuy.color = Color.fromHEX(new Color(), "#C4A47E");
          }
        };
        _proto.animateButton = function animateButton(buttonNode) {
          Tween.stopAllByTarget(buttonNode);
          buttonNode.scale = Vec3.ONE;
          var scaleTween = new Tween(buttonNode).to(0.1, {
            scale: new Vec3(1.25, 1.25, 1.25)
          }).to(0.1, {
            scale: Vec3.ONE
          });
          var colorTween = new Tween(buttonNode.getComponent(Sprite)).to(0.1, {
            color: new Color(180, 180, 180, 255)
          }).to(0.1, {
            color: Color.WHITE
          });
          scaleTween.start();
          colorTween.start();
        };
        _proto.showBuyItems = function showBuyItems() {
          var _this2 = this;
          this.clearItems(this.purchaseItemPool, this.purchaseScrollView);
          var items = ItemDataManager.instance.getAllItems();
          items.forEach(function (item) {
            if (parseInt(item.buy_price) > 0) {
              _this2.createItemNode(item, item.png, true, _this2.purchaseScrollView, _this2.purchaseItemPool);
            }
          });
        };
        _proto.showSellItems = function showSellItems() {
          var _this$inventoryCompon2,
            _this3 = this;
          this.clearItems(this.sellItemPool, this.sellScrollView);
          var inventoryItems = ((_this$inventoryCompon2 = this.inventoryComponent) == null ? void 0 : _this$inventoryCompon2.getAllItems()) || [];
          console.log("Showing sell items: " + inventoryItems.length);
          inventoryItems.forEach(function (item) {
            if (item.sellPrice > 0) {
              _this3.createItemNode(item, item.iconName, false, _this3.sellScrollView, _this3.sellItemPool);
            }
          });
        };
        _proto.clearItems = function clearItems(itemPool, scrollView) {
          itemPool.forEach(function (item) {
            item.removeFromParent();
            item.active = false;
          });
          scrollView.content.removeAllChildren();
        };
        _proto.createItemNode = function createItemNode(item, spriteName, isBuyMode, scrollView, itemPool) {
          var _this$inventoryCompon3,
            _this4 = this,
            _scrollView$content;
          var itemNode;
          if (itemPool.length > 0) {
            itemNode = itemPool.pop();
            itemNode.active = true;
          } else {
            itemNode = instantiate(this.itemPrefab);
          }
          var sprite = itemNode.getComponentInChildren(Sprite);
          var labelNum = sprite.getComponentInChildren(Label);
          var label = itemNode.getComponentInChildren(Label);
          var button = itemNode.getComponentInChildren(Button);
          var price = button.node.getComponentInChildren(Label);

          // Load and set sprite
          ResourceManager.instance.loadAsset("" + SharedDefines.WINDOW_SHOP_TEXTURES + spriteName + "/spriteFrame", SpriteFrame).then(function (spriteFrame) {
            if (spriteFrame) {
              sprite.spriteFrame = spriteFrame;
            }
          });

          // Set label text
          label.string = item.description; //isBuyMode ? `${item.buy_price}` : `${item.sell_price}`;
          price.string = isBuyMode ? "" + item.buy_price : "" + item.sellPrice;
          var inventoryItem = ((_this$inventoryCompon3 = this.inventoryComponent) == null ? void 0 : _this$inventoryCompon3.getItem(item.id)) || null;
          if (!isBuyMode && inventoryItem && inventoryItem.quantity > 1) {
            labelNum.node.active = true;
            labelNum.string = "x" + inventoryItem.quantity;
          } else {
            labelNum.node.active = false;
          }

          // Setup button click event
          button.node.off(Button.EventType.CLICK);
          button.node.on(Button.EventType.CLICK, function () {
            if (isBuyMode) {
              _this4.buyItem(item);
            } else {
              _this4.sellItem(button, item);
            }
          }, this);
          (_scrollView$content = scrollView.content) == null || _scrollView$content.addChild(itemNode);
        };
        _proto.buyItem = function buyItem(item) {
          var _this$playerControlle2;
          var price = parseInt(item.buy_price);
          if (((_this$playerControlle2 = this.playerController) == null ? void 0 : _this$playerControlle2.playerState.gold) >= price) {
            NetworkManager.instance.buyItem(item.id, 1);
          } else {
            console.log("Not enough gold to buy this item!");
          }
        };
        _proto.sellItem = /*#__PURE__*/function () {
          var _sellItem = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(button, inventoryItem) {
            var _this5 = this;
            var sellItemResult, item, _this$inventoryCompon4, price, coinEffect;
            return _regeneratorRuntime().wrap(function _callee$(_context) {
              while (1) switch (_context.prev = _context.next) {
                case 0:
                  _context.next = 2;
                  return NetworkManager.instance.sellItem(inventoryItem.id, 1);
                case 2:
                  sellItemResult = _context.sent;
                  item = ItemDataManager.instance.getItemById(sellItemResult.data.item_id);
                  if (!item) {
                    _context.next = 19;
                    break;
                  }
                  price = parseInt(item.sell_price);
                  if (!((_this$inventoryCompon4 = this.inventoryComponent) != null && _this$inventoryCompon4.removeItem(item.id))) {
                    _context.next = 16;
                    break;
                  }
                  console.log("sellItem success");
                  _context.next = 10;
                  return UIEffectHelper.playCoinCollectionEffect(CoinType.COIN, this.node, button.node.getWorldPosition(), this.coinDisplay.node.getWorldPosition());
                case 10:
                  coinEffect = _context.sent;
                  coinEffect.node.on('effectComplete', function () {
                    _this5.playerController.playerState.gold += price;
                    console.log("Sold item: " + item.name + " for " + price + " gold");
                    //this.showSellItems(); 
                  });
                  // this.playerController!.playerState.gold += price;
                  console.log("Sold item: " + item.name + " for " + price + " gold");
                  this.showSellItems();
                  _context.next = 17;
                  break;
                case 16:
                  console.log("Failed to sell item!");
                case 17:
                  _context.next = 20;
                  break;
                case 19:
                  console.log("The item is not found!");
                case 20:
                case "end":
                  return _context.stop();
              }
            }, _callee, this);
          }));
          function sellItem(_x, _x2) {
            return _sellItem.apply(this, arguments);
          }
          return sellItem;
        }();
        _proto.onDestroy = function onDestroy() {
          var _this$buyButton2, _this$sellButton2;
          _WindowBase.prototype.onDestroy.call(this);
          (_this$buyButton2 = this.buyButton) == null || _this$buyButton2.node.off(Button.EventType.CLICK, this.onBuyButtonClicked, this);
          (_this$sellButton2 = this.sellButton) == null || _this$sellButton2.node.off(Button.EventType.CLICK, this.onSellButtonClicked, this);
        };
        return ShopWindow;
      }(WindowBase), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "purchaseNode", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "sellNode", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "purchaseScrollView", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "sellScrollView", [_dec5], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "itemPrefab", [_dec6], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "coinDisplay", [_dec7], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "diamondDisplay", [_dec8], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "buyButton", [_dec9], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "sellButton", [_dec10], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor10 = _applyDecoratedDescriptor(_class2.prototype, "closeButton", [_dec11], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      })), _class2)) || _class));
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/SpriteHelper.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc'], function (exports) {
  var _asyncToGenerator, _regeneratorRuntime, cclegacy, Color, resources, SpriteAtlas;
  return {
    setters: [function (module) {
      _asyncToGenerator = module.asyncToGenerator;
      _regeneratorRuntime = module.regeneratorRuntime;
    }, function (module) {
      cclegacy = module.cclegacy;
      Color = module.Color;
      resources = module.resources;
      SpriteAtlas = module.SpriteAtlas;
    }],
    execute: function () {
      cclegacy._RF.push({}, "a8994+B2RdDKbg5UKOrhAWP", "SpriteHelper", undefined);
      var SpriteHelper = exports('SpriteHelper', /*#__PURE__*/function () {
        function SpriteHelper() {}
        /**
         * 从给定的Atlas中获取SpriteFrame
         * @param atlas 已加载的SpriteAtlas
         * @param name SpriteFrame的名称
         * @returns SpriteFrame | null
         */
        SpriteHelper.getSpriteFrameFromAtlas = function getSpriteFrameFromAtlas(atlas, name) {
          if (!atlas) {
            console.error('SpriteHelper: Atlas is null or undefined');
            return null;
          }
          var spriteFrame = atlas.getSpriteFrame(name);
          if (!spriteFrame) {
            console.warn("SpriteHelper: SpriteFrame '" + name + "' not found in atlas");
          }
          return spriteFrame;
        }

        /**
         * 异步从资源中加载Atlas并获取SpriteFrame
         * @param atlasPath Atlas资源路径
         * @param name SpriteFrame的名称
         * @returns Promise<SpriteFrame | null>
         */;
        SpriteHelper.getSpriteFrameFromPath = /*#__PURE__*/
        function () {
          var _getSpriteFrameFromPath = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(atlasPath, name) {
            var _this = this;
            return _regeneratorRuntime().wrap(function _callee$(_context) {
              while (1) switch (_context.prev = _context.next) {
                case 0:
                  return _context.abrupt("return", new Promise(function (resolve) {
                    resources.load(atlasPath, SpriteAtlas, function (err, atlas) {
                      if (err) {
                        console.error("SpriteHelper: Failed to load atlas at path '" + atlasPath + "'", err);
                        resolve(null);
                        return;
                      }
                      var spriteFrame = _this.getSpriteFrameFromAtlas(atlas, name);
                      resolve(spriteFrame);
                    });
                  }));
                case 1:
                case "end":
                  return _context.stop();
              }
            }, _callee);
          }));
          function getSpriteFrameFromPath(_x, _x2) {
            return _getSpriteFrameFromPath.apply(this, arguments);
          }
          return getSpriteFrameFromPath;
        }()
        /**
         * 调整Sprite的透明度
         * @param sprite 要调整的Sprite组件
         * @param opacity 0-255之间的透明度值
         */;

        SpriteHelper.setSpriteeOpacity = function setSpriteeOpacity(sprite, opacity) {
          if (!sprite) {
            console.error('SpriteHelper: Sprite is null or undefined');
            return;
          }
          opacity = Math.max(0, Math.min(255, opacity));
          var color = sprite.color;
          sprite.color = new Color(color.r, color.g, color.b, opacity);
        }

        //get sprite color
        ;

        SpriteHelper.getSpriteColor = function getSpriteColor(sprite) {
          if (!sprite) {
            console.error('SpriteHelper: Sprite is null or undefined');
            return new Color(0, 0, 0, 0);
          }
          return sprite.color;
        }

        //set sprite color
        ;

        SpriteHelper.setSpriteColor = function setSpriteColor(sprite, color) {
          if (!sprite) {
            console.error('SpriteHelper: Sprite is null or undefined');
            return;
          }
          sprite.color = color;
        }

        /**
         * 从给定的Atlas中设置Sprite的SpriteFrame
         * @param sprite 要设置的Sprite组件
         * @param atlas 已加载的SpriteAtlas
         * @param name SpriteFrame的名称
         * @returns boolean 是否设置成功
         */;
        SpriteHelper.setSpriteFrameFromAtlas = function setSpriteFrameFromAtlas(sprite, atlas, name) {
          if (!sprite) {
            console.error('SpriteHelper: Sprite is null or undefined');
            return false;
          }
          if (!atlas) {
            console.error('SpriteHelper: Atlas is null or undefined');
            return false;
          }
          var spriteFrame = this.getSpriteFrameFromAtlas(atlas, name);
          if (spriteFrame) {
            sprite.spriteFrame = spriteFrame;
            return true;
          } else {
            console.log("SpriteHelper: SpriteFrame '" + name + "' not found in atlas");
          }
          return false;
        }

        /**
         * 异步设置Sprite的SpriteFrame
         * @param sprite 要设置的Sprite组件
         * @param atlasPath Atlas资源路径
         * @param name SpriteFrame的名称
         * @returns Promise<boolean> 是否设置成功
         */;
        SpriteHelper.setSpriteFrameFromPath = /*#__PURE__*/
        function () {
          var _setSpriteFrameFromPath = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2(sprite, atlasPath, name) {
            var spriteFrame;
            return _regeneratorRuntime().wrap(function _callee2$(_context2) {
              while (1) switch (_context2.prev = _context2.next) {
                case 0:
                  if (sprite) {
                    _context2.next = 3;
                    break;
                  }
                  console.error('SpriteHelper: Sprite is null or undefined');
                  return _context2.abrupt("return", false);
                case 3:
                  _context2.next = 5;
                  return this.getSpriteFrameFromPath(atlasPath, name);
                case 5:
                  spriteFrame = _context2.sent;
                  if (!spriteFrame) {
                    _context2.next = 9;
                    break;
                  }
                  sprite.spriteFrame = spriteFrame;
                  return _context2.abrupt("return", true);
                case 9:
                  return _context2.abrupt("return", false);
                case 10:
                case "end":
                  return _context2.stop();
              }
            }, _callee2, this);
          }));
          function setSpriteFrameFromPath(_x3, _x4, _x5) {
            return _setSpriteFrameFromPath.apply(this, arguments);
          }
          return setSpriteFrameFromPath;
        }();
        return SpriteHelper;
      }());
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/SyntheDataManager.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './SharedDefines.ts'], function (exports) {
  var _createClass, _asyncToGenerator, _regeneratorRuntime, cclegacy, resources, JsonAsset, SharedDefines;
  return {
    setters: [function (module) {
      _createClass = module.createClass;
      _asyncToGenerator = module.asyncToGenerator;
      _regeneratorRuntime = module.regeneratorRuntime;
    }, function (module) {
      cclegacy = module.cclegacy;
      resources = module.resources;
      JsonAsset = module.JsonAsset;
    }, function (module) {
      SharedDefines = module.SharedDefines;
    }],
    execute: function () {
      cclegacy._RF.push({}, "42232cQId5CpJftA8OhJBjy", "SyntheDataManager", undefined);
      var SyntheDataManager = exports('SyntheDataManager', /*#__PURE__*/function () {
        function SyntheDataManager() {
          this.syntheDataList = [];
        }
        var _proto = SyntheDataManager.prototype;
        _proto.loadSyntheData = /*#__PURE__*/function () {
          var _loadSyntheData = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee() {
            var _this = this;
            return _regeneratorRuntime().wrap(function _callee$(_context) {
              while (1) switch (_context.prev = _context.next) {
                case 0:
                  return _context.abrupt("return", new Promise(function (resolve, reject) {
                    resources.load(SharedDefines.JSON_SYNTHE_DATA, JsonAsset, function (err, jsonAsset) {
                      if (err) {
                        console.error('Failed to load SyntheData:', err);
                        reject(err);
                        return;
                      }
                      _this.syntheDataList = jsonAsset.json.list;
                      resolve();
                    });
                  }));
                case 1:
                case "end":
                  return _context.stop();
              }
            }, _callee);
          }));
          function loadSyntheData() {
            return _loadSyntheData.apply(this, arguments);
          }
          return loadSyntheData;
        }();
        _proto.findSyntheDataById = function findSyntheDataById(id) {
          return this.syntheDataList.find(function (synthe) {
            return synthe.id === id;
          });
        };
        _proto.findSyntheDataByName = function findSyntheDataByName(name) {
          return this.syntheDataList.find(function (synthe) {
            return synthe.name === name;
          });
        };
        _proto.filterSyntheDataByBuild = function filterSyntheDataByBuild(build) {
          return this.syntheDataList.filter(function (synthe) {
            return synthe.build === build;
          });
        };
        _proto.getAllSyntheData = function getAllSyntheData() {
          return [].concat(this.syntheDataList);
        };
        _proto.getSyntheDataCount = function getSyntheDataCount() {
          return this.syntheDataList.length;
        };
        _proto.isSyntheDataLoaded = function isSyntheDataLoaded() {
          return this.syntheDataList.length > 0;
        };
        _createClass(SyntheDataManager, null, [{
          key: "instance",
          get: function get() {
            if (this._instance === null) {
              this._instance = new SyntheDataManager();
            }
            return this._instance;
          }
        }]);
        return SyntheDataManager;
      }());
      SyntheDataManager._instance = null;
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/TipsWindow.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './WindowBase.ts'], function (exports) {
  var _applyDecoratedDescriptor, _inheritsLoose, _initializerDefineProperty, _assertThisInitialized, cclegacy, _decorator, Label, Node, Button, WindowBase;
  return {
    setters: [function (module) {
      _applyDecoratedDescriptor = module.applyDecoratedDescriptor;
      _inheritsLoose = module.inheritsLoose;
      _initializerDefineProperty = module.initializerDefineProperty;
      _assertThisInitialized = module.assertThisInitialized;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      Label = module.Label;
      Node = module.Node;
      Button = module.Button;
    }, function (module) {
      WindowBase = module.WindowBase;
    }],
    execute: function () {
      var _dec, _dec2, _dec3, _dec4, _class, _class2, _descriptor, _descriptor2, _descriptor3;
      cclegacy._RF.push({}, "ed04f8RRXZABYF6cb2Y5x2p", "TipsWindow", undefined);
      var ccclass = _decorator.ccclass,
        property = _decorator.property;
      var TipsMode = /*#__PURE__*/function (TipsMode) {
        TipsMode[TipsMode["OK"] = 0] = "OK";
        TipsMode[TipsMode["OK_CANCEL"] = 1] = "OK_CANCEL";
        return TipsMode;
      }(TipsMode || {});
      var TipsWindow = exports('TipsWindow', (_dec = ccclass('TipsWindow'), _dec2 = property(Label), _dec3 = property(Node), _dec4 = property(Node), _dec(_class = (_class2 = /*#__PURE__*/function (_WindowBase) {
        _inheritsLoose(TipsWindow, _WindowBase);
        function TipsWindow() {
          var _this;
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          _this = _WindowBase.call.apply(_WindowBase, [this].concat(args)) || this;
          _initializerDefineProperty(_this, "lblMessage", _descriptor, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "nodeOk", _descriptor2, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "nodeOkCancel", _descriptor3, _assertThisInitialized(_this));
          _this.mode = TipsMode.OK;
          _this.okCallback = null;
          _this.cancelCallback = null;
          return _this;
        }
        var _proto = TipsWindow.prototype;
        _proto.initialize = function initialize() {
          _WindowBase.prototype.initialize.call(this);
        };
        _proto.show = function show() {
          var _WindowBase$prototype;
          for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            args[_key2] = arguments[_key2];
          }
          (_WindowBase$prototype = _WindowBase.prototype.show).call.apply(_WindowBase$prototype, [this].concat(args));
          if (args.length >= 2) {
            var message = args[0];
            this.mode = args[1];
            this.okCallback = args[2];
            this.cancelCallback = args[3];
            this.updateUI(message);
            this.setupEventListeners();
          }
        };
        _proto.setupEventListeners = function setupEventListeners() {
          var _currentNode$getChild, _currentNode$getChild2;
          var currentNode = this.mode === TipsMode.OK ? this.nodeOk : this.nodeOkCancel;
          var btnOk = currentNode == null || (_currentNode$getChild = currentNode.getChildByName('btnOk')) == null ? void 0 : _currentNode$getChild.getComponent(Button);
          var btnCancel = currentNode == null || (_currentNode$getChild2 = currentNode.getChildByName('btnCancel')) == null ? void 0 : _currentNode$getChild2.getComponent(Button);
          if (btnOk) {
            btnOk.node.on(Button.EventType.CLICK, this.onOkButtonClicked, this);
          }
          if (btnCancel) {
            btnCancel.node.on(Button.EventType.CLICK, this.onCancelButtonClicked, this);
          }
        };
        _proto.updateUI = function updateUI(message) {
          //set active
          this.nodeOk.active = this.mode === TipsMode.OK;
          this.nodeOkCancel.active = this.mode === TipsMode.OK_CANCEL;
          if (this.lblMessage) {
            this.lblMessage.string = message;
          }
        };
        _proto.onOkButtonClicked = function onOkButtonClicked() {
          if (this.okCallback) {
            this.okCallback();
          }
          this.hide();
        };
        _proto.onCancelButtonClicked = function onCancelButtonClicked() {
          if (this.cancelCallback) {
            this.cancelCallback();
          }
          this.hide();
        };
        _proto.hide = function hide() {
          this.removeEventListeners();
          _WindowBase.prototype.hide.call(this);
        };
        _proto.removeEventListeners = function removeEventListeners() {
          var _currentNode$getChild3, _currentNode$getChild4;
          var currentNode = this.mode === TipsMode.OK ? this.nodeOk : this.nodeOkCancel;
          var btnOk = currentNode == null || (_currentNode$getChild3 = currentNode.getChildByName('btnOk')) == null ? void 0 : _currentNode$getChild3.getComponent(Button);
          var btnCancel = currentNode == null || (_currentNode$getChild4 = currentNode.getChildByName('btnCancel')) == null ? void 0 : _currentNode$getChild4.getComponent(Button);
          if (btnOk) {
            btnOk.node.off(Button.EventType.CLICK, this.onOkButtonClicked, this);
          }
          if (btnCancel) {
            btnCancel.node.off(Button.EventType.CLICK, this.onCancelButtonClicked, this);
          }
        };
        _proto.onDestroy = function onDestroy() {
          _WindowBase.prototype.onDestroy.call(this);
          this.removeEventListeners();
        };
        return TipsWindow;
      }(WindowBase), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "lblMessage", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "nodeOk", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "nodeOkCancel", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      })), _class2)) || _class));
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/ToastWindow.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './WindowBase.ts'], function (exports) {
  var _applyDecoratedDescriptor, _inheritsLoose, _initializerDefineProperty, _assertThisInitialized, cclegacy, _decorator, Label, Node, UIOpacity, tween, Vec3, WindowBase;
  return {
    setters: [function (module) {
      _applyDecoratedDescriptor = module.applyDecoratedDescriptor;
      _inheritsLoose = module.inheritsLoose;
      _initializerDefineProperty = module.initializerDefineProperty;
      _assertThisInitialized = module.assertThisInitialized;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      Label = module.Label;
      Node = module.Node;
      UIOpacity = module.UIOpacity;
      tween = module.tween;
      Vec3 = module.Vec3;
    }, function (module) {
      WindowBase = module.WindowBase;
    }],
    execute: function () {
      var _dec, _dec2, _dec3, _class, _class2, _descriptor, _descriptor2;
      cclegacy._RF.push({}, "8ae5b/wMrdNR5jxBd4gj2QM", "ToastWindow", undefined);
      var ccclass = _decorator.ccclass,
        property = _decorator.property;
      var ToastWindow = exports('ToastWindow', (_dec = ccclass('ToastWindow'), _dec2 = property(Label), _dec3 = property(Node), _dec(_class = (_class2 = /*#__PURE__*/function (_WindowBase) {
        _inheritsLoose(ToastWindow, _WindowBase);
        function ToastWindow() {
          var _this;
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          _this = _WindowBase.call.apply(_WindowBase, [this].concat(args)) || this;
          _initializerDefineProperty(_this, "txtToast", _descriptor, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "layoutNode", _descriptor2, _assertThisInitialized(_this));
          _this.currentTween = null;
          return _this;
        }
        var _proto = ToastWindow.prototype;
        _proto.initialize = function initialize() {
          _WindowBase.prototype.initialize.call(this);
        };
        _proto.show = function show() {
          var _WindowBase$prototype;
          for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            args[_key2] = arguments[_key2];
          }
          (_WindowBase$prototype = _WindowBase.prototype.show).call.apply(_WindowBase$prototype, [this].concat(args));
          if (args.length > 0 && typeof args[0] === 'string') {
            this.showToast(args[0]);
          }
        };
        _proto.showToast = function showToast(message) {
          var _this2 = this;
          if (this.txtToast) {
            this.txtToast.string = message;
          }
          if (this.currentTween) {
            this.currentTween.stop();
          }
          this.layoutNode.active = true;
          var uiOpacity = this.layoutNode.getComponent(UIOpacity) || this.layoutNode.addComponent(UIOpacity);
          uiOpacity.opacity = 0;
          this.currentTween = tween(this.layoutNode).to(0.3, {
            scale: new Vec3(1, 1, 1)
          }).call(function () {
            tween(uiOpacity).to(0.3, {
              opacity: 255
            }).delay(2).to(0.3, {
              opacity: 0
            }).call(function () {
              _this2.layoutNode.active = false;
            }).start();
          }).start();
        };
        _proto.hide = function hide() {
          if (this.currentTween) {
            this.currentTween.stop();
          }
          this.layoutNode.active = false;
          _WindowBase.prototype.hide.call(this);
        };
        return ToastWindow;
      }(WindowBase), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "txtToast", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "layoutNode", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      })), _class2)) || _class));
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/UIAdaptComponent.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './SharedDefines.ts'], function (exports) {
  var _inheritsLoose, cclegacy, _decorator, screen, view, ResolutionPolicy, EventTarget, Component, SharedDefines;
  return {
    setters: [function (module) {
      _inheritsLoose = module.inheritsLoose;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      screen = module.screen;
      view = module.view;
      ResolutionPolicy = module.ResolutionPolicy;
      EventTarget = module.EventTarget;
      Component = module.Component;
    }, function (module) {
      SharedDefines = module.SharedDefines;
    }],
    execute: function () {
      var _dec, _class;
      cclegacy._RF.push({}, "d0bdebnz9FE77EoX4yDppAt", "UIAdaptComponent", undefined);
      var ccclass = _decorator.ccclass,
        property = _decorator.property;
      var Orientation = exports('Orientation', /*#__PURE__*/function (Orientation) {
        Orientation[Orientation["Portrait"] = 0] = "Portrait";
        Orientation[Orientation["Landscape"] = 1] = "Landscape";
        return Orientation;
      }({}));
      var UIAdaptComponent = exports('UIAdaptComponent', (_dec = ccclass('UIAdaptComponent'), _dec(_class = /*#__PURE__*/function (_Component) {
        _inheritsLoose(UIAdaptComponent, _Component);
        function UIAdaptComponent() {
          var _this;
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          _this = _Component.call.apply(_Component, [this].concat(args)) || this;
          _this.orientation = Orientation.Portrait;
          _this.eventTarget = new EventTarget();
          return _this;
        }
        var _proto = UIAdaptComponent.prototype;
        _proto.start = function start() {
          var _this2 = this;
          //监听窗口大小变化时的回调，每次窗口变化都要自动适配
          screen.on('window-resize', function (width, height) {
            return _this2.updateScreenSize();
          }, this);
          this.updateScreenSize();
        };
        _proto.update = function update(deltaTime) {};
        _proto.updateOrientation = function updateOrientation() {
          var screenSize = screen.windowSize;
          var newIsLandscape = screenSize.width > screenSize.height;
          if (newIsLandscape && this.orientation !== Orientation.Landscape) {
            this.orientation = newIsLandscape ? Orientation.Landscape : Orientation.Portrait;
            this.eventTarget.emit(SharedDefines.EVENT_ORIENTATION_CHANGED, this.orientation);
          }
        };
        _proto.updateScreenSize = function updateScreenSize() {
          console.log("updateScreenSize");
          // 当前屏幕分辨率比例
          var screenRatio = screen.windowSize.width / screen.windowSize.height;
          // 设计稿分辨率比例
          var designRatio = view.getDesignResolutionSize().width / view.getDesignResolutionSize().height;
          if (screenRatio <= 1) {
            console.log("竖屏");
            // 屏幕高度大于或等于宽度，即竖屏
            if (screenRatio <= designRatio) {
              this.updateFitWidth();
            } else {
              // 此时屏幕比例大于设计比例
              // 为了保证纵向的游戏内容不受影响，应该使用 fitHeight 模式
              this.updateFitHeight();
            }
          } else {
            console.log("横屏");
            // 屏幕宽度大于高度，即横屏
            this.updateFitHeight();
          }
        };
        _proto.updateFitWidth = function updateFitWidth() {
          view.setDesignResolutionSize(view.getDesignResolutionSize().width, view.getDesignResolutionSize().height, ResolutionPolicy.FIXED_WIDTH);
        };
        _proto.updateFitHeight = function updateFitHeight() {
          view.setDesignResolutionSize(view.getDesignResolutionSize().width, view.getDesignResolutionSize().height, ResolutionPolicy.FIXED_HEIGHT);
        };
        return UIAdaptComponent;
      }(Component)) || _class));
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/UIEffectHelper.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './ResourceManager.ts', './CoinCollectionEffectComponent.ts', './SharedDefines.ts'], function (exports) {
  var _asyncToGenerator, _regeneratorRuntime, cclegacy, _decorator, instantiate, ResourceManager, CoinCollectionEffectComponent, SharedDefines;
  return {
    setters: [function (module) {
      _asyncToGenerator = module.asyncToGenerator;
      _regeneratorRuntime = module.regeneratorRuntime;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      instantiate = module.instantiate;
    }, function (module) {
      ResourceManager = module.ResourceManager;
    }, function (module) {
      CoinCollectionEffectComponent = module.CoinCollectionEffectComponent;
    }, function (module) {
      SharedDefines = module.SharedDefines;
    }],
    execute: function () {
      var _dec, _class;
      cclegacy._RF.push({}, "d03b8ziZ1FBRprSLb42mnd0", "UIEffectHelper", undefined);
      var ccclass = _decorator.ccclass,
        property = _decorator.property;
      var UIEffectHelper = exports('UIEffectHelper', (_dec = ccclass('UIEffectHelper'), _dec(_class = /*#__PURE__*/function () {
        function UIEffectHelper() {}
        // 金币收集效果
        UIEffectHelper.playCoinCollectionEffect = /*#__PURE__*/
        function () {
          var _playCoinCollectionEffect = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(type, parent, startPos, targetPos) {
            var effectPrefab, effect, coinCollectionEffect;
            return _regeneratorRuntime().wrap(function _callee$(_context) {
              while (1) switch (_context.prev = _context.next) {
                case 0:
                  _context.next = 2;
                  return ResourceManager.instance.loadPrefab(SharedDefines.PREFAB_COIN_COLLECTION_EFFECT);
                case 2:
                  effectPrefab = _context.sent;
                  if (!effectPrefab) {
                    _context.next = 10;
                    break;
                  }
                  effect = instantiate(effectPrefab);
                  parent.addChild(effect);
                  effect.setPosition(startPos);
                  coinCollectionEffect = effect.getComponent(CoinCollectionEffectComponent);
                  coinCollectionEffect.play(type, startPos, targetPos);
                  return _context.abrupt("return", coinCollectionEffect);
                case 10:
                  return _context.abrupt("return", null);
                case 11:
                case "end":
                  return _context.stop();
              }
            }, _callee);
          }));
          function playCoinCollectionEffect(_x, _x2, _x3, _x4) {
            return _playCoinCollectionEffect.apply(this, arguments);
          }
          return playCoinCollectionEffect;
        }();
        return UIEffectHelper;
      }()) || _class));
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/UIHelper.ts", ['cc'], function (exports) {
  var cclegacy, _decorator, UITransform, Vec2;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      UITransform = module.UITransform;
      Vec2 = module.Vec2;
    }],
    execute: function () {
      cclegacy._RF.push({}, "4f94aoWOEBIMK41wQhPw3Sc", "UIHelper", undefined);
      var ccclass = _decorator.ccclass,
        property = _decorator.property;
      var UIHelper = exports('UIHelper', /*#__PURE__*/function () {
        function UIHelper() {}
        UIHelper.isPointInUINode = function isPointInUINode(point, node) {
          var uiTransform = node.getComponent(UITransform);
          if (!uiTransform) {
            return false;
          }
          var buttonRect = uiTransform.getBoundingBoxToWorld();
          return buttonRect.contains(point); //new Vec2(point.x, point.y)
        };

        UIHelper.isPointInUINodeWorldPosition = function isPointInUINodeWorldPosition(point, node) {
          var uiTransform = node.getComponent(UITransform);
          if (!uiTransform) {
            return false;
          }
          var buttonRect = uiTransform.getBoundingBoxToWorld();
          return buttonRect.contains(new Vec2(point.x, point.y)); //
        };

        return UIHelper;
      }());
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/WindowBase.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './GameController.ts', './WindowManager.ts'], function (exports) {
  var _applyDecoratedDescriptor, _inheritsLoose, _initializerDefineProperty, _assertThisInitialized, _createClass, cclegacy, _decorator, Node, Vec3, director, Tween, Component, GameController, WindowOrientation;
  return {
    setters: [function (module) {
      _applyDecoratedDescriptor = module.applyDecoratedDescriptor;
      _inheritsLoose = module.inheritsLoose;
      _initializerDefineProperty = module.initializerDefineProperty;
      _assertThisInitialized = module.assertThisInitialized;
      _createClass = module.createClass;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      Node = module.Node;
      Vec3 = module.Vec3;
      director = module.director;
      Tween = module.Tween;
      Component = module.Component;
    }, function (module) {
      GameController = module.GameController;
    }, function (module) {
      WindowOrientation = module.WindowOrientation;
    }],
    execute: function () {
      var _dec, _dec2, _class, _class2, _descriptor;
      cclegacy._RF.push({}, "ed3fbI+4w9EIaqTbHXEvVou", "WindowBase", undefined);
      var ccclass = _decorator.ccclass,
        property = _decorator.property;
      var WindowBase = exports('WindowBase', (_dec = ccclass('WindowBase'), _dec2 = property(Node), _dec(_class = (_class2 = /*#__PURE__*/function (_Component) {
        _inheritsLoose(WindowBase, _Component);
        function WindowBase() {
          var _this;
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          _this = _Component.call.apply(_Component, [this].concat(args)) || this;
          _initializerDefineProperty(_this, "animationNode", _descriptor, _assertThisInitialized(_this));
          _this.playingTween = null;
          _this.gameController = null;
          _this.originalContentSize = new Vec3();
          _this.windowOrientation = WindowOrientation.LANDSCAPE;
          _this.realScale = new Vec3();
          return _this;
        }
        var _proto = WindowBase.prototype;
        _proto.onLoad = function onLoad() {};
        _proto.start = function start() {};
        _proto.initialize = function initialize(orientation) {
          var _director$getScene;
          if (orientation === void 0) {
            orientation = WindowOrientation.LANDSCAPE;
          }
          this.windowOrientation = orientation;
          var gameControllerNode = (_director$getScene = director.getScene()) == null ? void 0 : _director$getScene.getChildByName('GameController');
          if (gameControllerNode) {
            this.gameController = gameControllerNode.getComponent(GameController);
          }
        };
        _proto.show = function show() {
          var _this2 = this;
          this.node.active = true;
          // this.updateRealScale();

          //this.playJellyAnimation();
          //schedule delay 0.1 second
          this.scheduleOnce(function () {
            _this2.playJellyAnimation();
          }, 0.03);
        };
        _proto.hide = function hide() {
          if (this.playingTween) {
            this.playingTween.stop();
            this.playingTween = null;
            this.animationNode.setScale(1, 1, 1);
          }
          this.node.active = false;
        };
        _proto.onOrientationChange = function onOrientationChange(windowOrientation) {};
        _proto.playJellyAnimation = function playJellyAnimation() {
          var _this3 = this;
          //if animationNode is null, return
          if (!this.animationNode) {
            return;
          }
          var node = this.animationNode;
          var originalScale = Vec3.ONE; //node.scale.clone();

          // Reset scale
          node.setScale(0.7, 0.7, 1);

          // Create the animation
          this.playingTween = new Tween(node)
          //.to(0.1, { scale: new Vec3(0.7, 0.7, 1) })
          .to(0.03, {
            scale: new Vec3(1.03, 1.03, 1)
          }, {
            easing: 'bounceOut'
          }).to(0.06, {
            scale: new Vec3(0.97, 0.97, 1)
          }).to(0.9, {
            scale: originalScale
          }).call(function () {
            _this3.onJellyAnimationEnd();
          }).start();
        };
        _proto.onJellyAnimationEnd = function onJellyAnimationEnd() {
          this.playingTween = null;
          this.animationNode.setScale(1, 1, 1);
        };
        _createClass(WindowBase, [{
          key: "WindowOrientation",
          get:
          //getter and setter 
          function get() {
            return this.windowOrientation;
          },
          set: function set(value) {
            this.windowOrientation = value;
            this.onOrientationChange(value);
          }
        }, {
          key: "RealScale",
          get:
          //getter 
          function get() {
            return this.realScale;
          }
        }]);
        return WindowBase;
      }(Component), _descriptor = _applyDecoratedDescriptor(_class2.prototype, "animationNode", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _class2)) || _class));
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/WindowManager.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './ResourceManager.ts', './WindowBase.ts'], function (exports) {
  var _applyDecoratedDescriptor, _inheritsLoose, _initializerDefineProperty, _assertThisInitialized, _createClass, _asyncToGenerator, _regeneratorRuntime, cclegacy, _decorator, Camera, Node, Component, instantiate, ResourceManager, WindowBase;
  return {
    setters: [function (module) {
      _applyDecoratedDescriptor = module.applyDecoratedDescriptor;
      _inheritsLoose = module.inheritsLoose;
      _initializerDefineProperty = module.initializerDefineProperty;
      _assertThisInitialized = module.assertThisInitialized;
      _createClass = module.createClass;
      _asyncToGenerator = module.asyncToGenerator;
      _regeneratorRuntime = module.regeneratorRuntime;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      Camera = module.Camera;
      Node = module.Node;
      Component = module.Component;
      instantiate = module.instantiate;
    }, function (module) {
      ResourceManager = module.ResourceManager;
    }, function (module) {
      WindowBase = module.WindowBase;
    }],
    execute: function () {
      var _dec, _dec2, _dec3, _class, _class2, _descriptor, _descriptor2, _class3;
      cclegacy._RF.push({}, "abf38uGofRBMJ/xsROxtr96", "WindowManager", undefined);
      var ccclass = _decorator.ccclass,
        property = _decorator.property;

      //define enum for screen orientation
      var WindowOrientation = exports('WindowOrientation', /*#__PURE__*/function (WindowOrientation) {
        WindowOrientation["PORTRAIT"] = "portrait";
        WindowOrientation["LANDSCAPE"] = "landscape";
        return WindowOrientation;
      }({}));
      var WindowManager = exports('WindowManager', (_dec = ccclass('WindowManager'), _dec2 = property(Camera), _dec3 = property(Node), _dec(_class = (_class2 = (_class3 = /*#__PURE__*/function (_Component) {
        _inheritsLoose(WindowManager, _Component);
        function WindowManager() {
          var _this;
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          _this = _Component.call.apply(_Component, [this].concat(args)) || this;
          _initializerDefineProperty(_this, "camera", _descriptor, _assertThisInitialized(_this));
          _this.currentOrientation = WindowOrientation.LANDSCAPE;
          _this.windowMap = new Map();
          _initializerDefineProperty(_this, "windowsContainer", _descriptor2, _assertThisInitialized(_this));
          return _this;
        }
        var _proto = WindowManager.prototype;
        _proto.onLoad = function onLoad() {
          WindowManager._instance = this;
        };
        _proto.initialize = function initialize() {
          if (!this.windowsContainer) {
            console.warn('Windows container is not set. Please assign it in the editor.');
          }
        };
        _proto.show = /*#__PURE__*/function () {
          var _show = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(name) {
            var _windowBase;
            var windowBase,
              orientationStr,
              prefabPath,
              prefab,
              windowNode,
              _len2,
              args,
              _key2,
              _args = arguments;
            return _regeneratorRuntime().wrap(function _callee$(_context) {
              while (1) switch (_context.prev = _context.next) {
                case 0:
                  windowBase = this.windowMap.get(name);
                  if (windowBase) {
                    _context.next = 21;
                    break;
                  }
                  orientationStr = this.currentOrientation === WindowOrientation.LANDSCAPE ? "landscape" : "portrait"; // Load the prefab
                  prefabPath = "ui/windows/" + orientationStr + "/" + name;
                  _context.next = 6;
                  return ResourceManager.instance.loadPrefab(prefabPath);
                case 6:
                  prefab = _context.sent;
                  if (prefab) {
                    _context.next = 10;
                    break;
                  }
                  console.error("Failed to load prefab: " + name);
                  return _context.abrupt("return");
                case 10:
                  // Instantiate the prefab
                  windowNode = instantiate(prefab);
                  if (this.windowsContainer) {
                    _context.next = 14;
                    break;
                  }
                  console.error('Windows container is not set');
                  return _context.abrupt("return");
                case 14:
                  this.windowsContainer.addChild(windowNode);

                  // Get WindowBase component
                  windowBase = windowNode.getComponent(WindowBase);
                  if (windowBase) {
                    _context.next = 19;
                    break;
                  }
                  console.error("WindowBase component not found on prefab: " + name);
                  return _context.abrupt("return");
                case 19:
                  // Initialize the window
                  windowBase.initialize(this.currentOrientation);

                  // Store the window node in the map
                  this.windowMap.set(name, windowBase);
                case 21:
                  for (_len2 = _args.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
                    args[_key2 - 1] = _args[_key2];
                  }
                  // Show the window
                  (_windowBase = windowBase).show.apply(_windowBase, args);
                  // Ensure the window is on top
                  windowBase.node.setSiblingIndex(windowBase.node.parent.children.length - 1);
                case 24:
                case "end":
                  return _context.stop();
              }
            }, _callee, this);
          }));
          function show(_x) {
            return _show.apply(this, arguments);
          }
          return show;
        }() //get window by name
        ;

        _proto.getWindow = function getWindow(name) {
          //check if window is already loaded
          var windowBase = this.windowMap.get(name);
          if (!windowBase) {
            console.warn("Window not found: " + name);
            return null;
          }
          return windowBase;
        };
        _proto.changeWindowOrientation = function changeWindowOrientation(isLandscape) {
          //暂不处理运行时 切换横竖屏
          this.currentOrientation = isLandscape ? WindowOrientation.LANDSCAPE : WindowOrientation.PORTRAIT;
          // this.windowMap.forEach((window) => {
          //     window.WindowOrientation = this.currentOrientation;
          // });
        };

        _proto.hide = function hide(name) {
          var windowBase = this.windowMap.get(name);
          if (windowBase) {
            windowBase.hide();
          } else {
            console.warn("Window not found: " + name);
          }
        };
        _createClass(WindowManager, [{
          key: "uiCamera",
          get:
          //getter camera
          function get() {
            return this.camera;
          }
        }], [{
          key: "instance",
          get: function get() {
            if (this._instance === null) {
              var node = new Node('WindowManager');
              this._instance = node.addComponent(WindowManager);
            }
            return this._instance;
          }
        }]);
        return WindowManager;
      }(Component), _class3._instance = null, _class3), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "camera", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "windowsContainer", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      })), _class2)) || _class));
      cclegacy._RF.pop();
    }
  };
});

(function(r) {
  r('virtual:///prerequisite-imports/main', 'chunks:///_virtual/main'); 
})(function(mid, cid) {
    System.register(mid, [cid], function (_export, _context) {
    return {
        setters: [function(_m) {
            var _exportObj = {};

            for (var _key in _m) {
              if (_key !== "default" && _key !== "__esModule") _exportObj[_key] = _m[_key];
            }
      
            _export(_exportObj);
        }],
        execute: function () { }
    };
    });
});