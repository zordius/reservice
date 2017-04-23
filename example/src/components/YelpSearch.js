import React from 'react';
import PropTypes from 'prop-types';

class YelpSearch extends React.Component {
  constructor(props) {
    super(props);
    this.state = { term: props.query.term };

    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    this.setState({ term: event.target.value });
  }

  render() {
    return (
      <form action="/">
        <input name="term" value={this.state.term} onChange={this.handleChange} />
        <input type="submit" value="SEARCH" />
      </form>
    );
  }
}

YelpSearch.propTypes = {
  query: PropTypes.object.isRequired,
};

export default YelpSearch;
