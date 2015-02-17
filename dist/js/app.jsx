/** @jsx React.DOM */
var DrinkList = React.createClass({
  createEntry: function(entry, key) {
      return <li key={entry}>{entry} drinks -- {key} minutes ago
      [<a href="#" onClick={this.props.decrement.bind(null, key)}>decrement</a>]
      </li>;
  },

  render: function() {
    return <ul>{this.props.entries.map(this.createEntry)}</ul>;
  }
});

var BACApp = React.createClass({
  getInitialState: function() {
    return {entries: [], minute: '', drinkCount: '', gender: 0, weight: 50};
  },
  
  decrement: function(time, e) {
    var decEntries = this.state.entries;
    
    if (decEntries[time] > 1) {
      decEntries[time]--;
    } else{
      decEntries.splice(time, 1);
    }

    this.setState({entries: decEntries});
  },
  
  handleChange: function (name, e) {
      var change = {};
      change[name] = e.target.value;
      this.setState(change);
  },
  
  handleSubmit: function(e) {
    e.preventDefault();
    
    var currentEntries = this.state.entries;
    
    if (this.state.minute in currentEntries) {
      currentEntries[this.state.minute] = currentEntries[this.state.minute] + parseInt(this.state.drinkCount);
    } else{
      currentEntries[this.state.minute] = parseInt(this.state.drinkCount);
    }
    
    this.refs.drinks.getDOMNode().focus();
    
    this.setState({entries: currentEntries, minute: '', drinkCount: ''});
  },
  
  bacAtTime: function(time) {
    //compute the EBAC data and the decay rate per hour; based on the wiki article
    //http://en.wikipedia.org/w/index.php?title=Blood_alcohol_content&oldid=647009086
    //male = 1; female = 0
    bodyWaterConstant = this.state.gender ? 0.58 : 0.49;
    ebacPerDrink = (.806 * 1.2) / (bodyWaterConstant * this.state.weight);
    elimRateMinute = (this.state.gender ? 0.015 : 0.017) / 60;
    
    //either we have a record for drinks right now, or we have zero new drinks
    var newBAC = (time in this.state.entries) ?  (this.state.entries[time] * ebacPerDrink) : 0;
    
    //if it's the base case, return just the newdrinks; otherwise recurse
    //the fancy Math.max footwork makes sure we only get positive BAC, or zero
    return (time == 0) ?  newBAC : Math.max(0, this.bacAtTime(time - 1) + newBAC - elimRateMinute);
  },
  
  computeTimeTable: function(untilTime) {
    var timeArray = [];
    var timeResolution = 10;
  
    for(var i = 0; i < untilTime; i++) {
      if (i % timeResolution == 0) {
        timeArray.push(<li key={i}>Minute {i}: {this.bacAtTime(i).toFixed(2)}</li>);
      }
    }
    
    return <ul>{timeArray}</ul>;
  },
  
  render: function() {
    return (
      <div>
        <div className="row">
          <div className="col-md-6">
            <h3>Add Drinks</h3>
            <form onSubmit={this.handleSubmit}>
              <input placeholder="drinks" ref="drinks" onChange={this.handleChange.bind(this, 'drinkCount')} value={this.state.drinkCount} />
              <input placeholder="minute" ref="minutes" onChange={this.handleChange.bind(this, 'minute')} value={this.state.minute} />
              <button className="btn btn-sm btn-success">Add Drink</button>
              <hr />
              <h3>Personal Data</h3>
              <select className="form-control pull-right width90" onChange={this.handleChange.bind(this, 'gender')} value={this.state.gender}>
                <option value="0">Male</option>
                <option value="1">Female</option>
              </select>
              <input placeholder="kg" ref="weight" onChange={this.handleChange.bind(this, 'weight')} value={this.state.weight} />
            </form>
          </div>
          <div className="col-md-6">
            <h3>Drink List</h3>
            <DrinkList entries={this.state.entries} decrement={this.decrement} />
          </div>
        </div>
        <div className="row">
          <h3>BAC Data</h3>
          <div className="col-md-12">{this.computeTimeTable(180)}</div>
        </div>
      </div>
    );
  }
});

React.render(<BACApp />, document.getElementById("container"));