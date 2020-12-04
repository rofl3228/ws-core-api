class EventController {
  get name() {
    return this.constructor.name;
  }
}

module.exports = EventController;
