import { Icon as VoltoIcon } from '@plone/volto/components';
import briefcaseSVG from '@plone/volto/icons/briefcase.svg';
import checkSVG from '@plone/volto/icons/check.svg';
import clearSVG from '@plone/volto/icons/clear.svg';
import formatClearSVG from '@plone/volto/icons/format-clear.svg';
import React, { Component } from 'react';
import { Accordion, Form, Menu } from 'semantic-ui-react';
import InlineForm from 'volto-slate/futurevolto/InlineForm';
// import InlineForm from 'volto-slate/futurevolto/InlineForm';
// import { Icon as VoltoIcon } from '@plone/volto/components';
// import superindexSVG from '@plone/volto/icons/superindex.svg';
// import briefcaseSVG from '@plone/volto/icons/briefcase.svg';
// import formatClearSVG from '@plone/volto/icons/format-clear.svg';
// import checkSVG from '@plone/volto/icons/check.svg';
// import clearSVG from '@plone/volto/icons/clear.svg';

export default class AccordionExampleMenu extends Component {
  state = { activeIndex: 0, titleRef: this.props.formData?.footnote };

  handleClick = (e, titleProps) => {
    const { index } = titleProps;
    const { activeIndex } = this.state;
    const newIndex = activeIndex === index ? -1 : index;
    console.log(this.props);

    this.setState({ activeIndex: newIndex });
  };
  handleChange = (e, { value }) => this.setState({ titleRef: value });

  render() {
    const { activeIndex } = this.state;
    const footnote = this.state.titleRef || this.props.formData.footnote;
    const newFormData = {
      ...this.props.formData,
      ...{ footnote },
    };

    const SizeForm = (
      <Form>
        <Form.Group grouped>
          <Form.Radio
            label="Comunismul in Romania"
            name="size"
            type="radio"
            value="Comunismul in Romania"
            checked={this.state.titleRef === 'Comunismul in Romania'}
            onChange={this.handleChange}
          />
          <Form.Radio
            label="Marxismul prost inteles"
            name="size"
            type="radio"
            value="Marxismul prost inteles"
            checked={this.state.titleRef === 'Marxismul prost inteles'}
            onChange={this.handleChange}
          />
          <Form.Radio
            label="Revolutia in Romania"
            name="size"
            type="radio"
            value="Revolutia in Romania"
            checked={this.state.titleRef === 'Revolutia in Romania'}
            onChange={this.handleChange}
          />
        </Form.Group>
      </Form>
    );
    const ColorForm = (
      <Form>
        <Form.Group grouped>
          <Form.Radio
            label="Pandemic 2020"
            name="size"
            type="radio"
            value="Pandemic 2020"
            checked={this.state.titleRef === 'Pandemic 2020'}
            onChange={this.handleChange}
          />
          <Form.Radio
            label="Australian fire 2020"
            name="size"
            type="radio"
            value="Australian fire 2020"
            checked={this.state.titleRef === 'Australian fire 2020'}
            onChange={this.handleChange}
          />
        </Form.Group>
      </Form>
    );
    return (
      <div>
        <InlineForm
          schema={this.props.schema}
          title={this.props.title}
          icon={<VoltoIcon size="24px" name={briefcaseSVG} />}
          onChangeField={(id, value) => {
            console.log('change fields');
            this.props.onChangeField(newFormData);
          }}
          formData={newFormData}
          headerActions={
            <>
              <button
                onClick={(id, value) => {
                  this.props.submitHandler(newFormData);
                }}
              >
                <VoltoIcon size="24px" name={checkSVG} />
              </button>
              <button onClick={this.props.clearHandler}>
                <VoltoIcon size="24px" name={formatClearSVG} />
              </button>
              <button onClick={this.props.hideHandler}>
                <VoltoIcon size="24px" name={clearSVG} />
              </button>
            </>
          }
        />
        {this.state.titleRef}
        <Accordion styled>
          <Menu.Item>
            <Accordion.Title
              active={activeIndex === 0}
              content="Romania collection"
              index={0}
              onClick={this.handleClick}
            />
            <Accordion.Content active={activeIndex === 0} content={SizeForm} />
          </Menu.Item>

          <Menu.Item>
            <Accordion.Title
              active={activeIndex === 1}
              content="2020 collection"
              index={1}
              onClick={this.handleClick}
            />
            <Accordion.Content active={activeIndex === 1} content={ColorForm} />
          </Menu.Item>
        </Accordion>
      </div>
    );
  }
}
