import React, { useState } from 'react';
import { Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import Datetime from 'react-datetime';
import 'react-datetime/css/react-datetime.css';
import { ticket_backend } from 'declarations/ticket_backend';
import { useNavigate } from 'react-router-dom';

const AddCarRoute = () => {
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleAddRoute = async (values, { setSubmitting }) => {
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const { from, destination, car, price, seats, leave_date } = values;
      const route_id = Date.now(); // Generate a unique ID

      //leave date time to text
      const leave_date_text = leave_date.toString();

      await ticket_backend.addRoute(
        Number(route_id),
        from,
        destination,
        car,
        Number(price),
        Number(seats),
        leave_date_text
      );
      setSuccessMessage('Route successfully added!');
    } catch (error) {
      setErrorMessage('Failed to add route. Please try again. ' + error);
    } finally {
      setSubmitting(false);
    }
  };

  const validationSchema = Yup.object().shape({
    from: Yup.string().required('Origin is required'),
    destination: Yup.string().required('Destination is required'),
    car: Yup.string().required('Car is required'),
    price: Yup.number().required('Price is required').positive('Price must be a positive number'),
    seats: Yup.number().required('Seats are required').positive('Seats must be a positive number'),
    leave_date: Yup.date()
      .required('Leave date is required')
      .min(new Date(), 'Leave date and time must be in the future'),
  });

  const handleViewRoutes = () => {
    navigate('/admin/view-routes');
  };

  // Disable past dates and times in the date-time picker
  const validFutureDates = (current) => {
    return current.isAfter(new Date());
  };

  return (
    <Row>
      <Col sm={12}>
        <Button variant="primary" onClick={handleViewRoutes} className="mb-3">
          View Routes
        </Button>
        <Card>
          <Card.Header>
            <Card.Title as="h5">Add Car Route</Card.Title>
          </Card.Header>
          <Card.Body>
            {successMessage && <Alert variant="success">{successMessage}</Alert>}
            {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}

            <Formik
              initialValues={{
                from: '',
                destination: '',
                car: '',
                price: '',
                seats: '',
                leave_date: new Date(),
              }}
              validationSchema={validationSchema}
              onSubmit={handleAddRoute}
            >
              {({
                values,
                handleChange,
                setFieldValue,
                handleSubmit,
                errors,
                touched,
                isSubmitting,
              }) => (
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>From</Form.Label>
                    <Form.Control
                      type="text"
                      name="from"
                      placeholder="Enter starting location"
                      value={values.from}
                      onChange={handleChange}
                      isInvalid={!!touched.from && !!errors.from}
                    />
                    {touched.from && errors.from && (
                      <Form.Control.Feedback type="invalid">{errors.from}</Form.Control.Feedback>
                    )}
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Destination</Form.Label>
                    <Form.Control
                      type="text"
                      name="destination"
                      placeholder="Enter destination"
                      value={values.destination}
                      onChange={handleChange}
                      isInvalid={!!touched.destination && !!errors.destination}
                    />
                    {touched.destination && errors.destination && (
                      <Form.Control.Feedback type="invalid">{errors.destination}</Form.Control.Feedback>
                    )}
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Car</Form.Label>
                    <Form.Control
                      type="text"
                      name="car"
                      placeholder="Enter car Plate Number"
                      value={values.car}
                      onChange={handleChange}
                      isInvalid={!!touched.car && !!errors.car}
                    />
                    {touched.car && errors.car && (
                      <Form.Control.Feedback type="invalid">{errors.car}</Form.Control.Feedback>
                    )}
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Price</Form.Label>
                    <Form.Control
                      type="number"
                      name="price"
                      placeholder="Enter price"
                      value={values.price}
                      onChange={handleChange}
                      isInvalid={!!touched.price && !!errors.price}
                    />
                    {touched.price && errors.price && (
                      <Form.Control.Feedback type="invalid">{errors.price}</Form.Control.Feedback>
                    )}
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Seats</Form.Label>
                    <Form.Control
                      type="number"
                      name="seats"
                      placeholder="Enter number of seats"
                      value={values.seats}
                      onChange={handleChange}
                      isInvalid={!!touched.seats && !!errors.seats}
                    />
                    {touched.seats && errors.seats && (
                      <Form.Control.Feedback type="invalid">{errors.seats}</Form.Control.Feedback>
                    )}
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Leave Date and Time</Form.Label>
                    <Datetime
                      value={values.leave_date}
                      onChange={(date) => setFieldValue('leave_date', date)}
                      isValidDate={validFutureDates}
                      inputProps={{
                        placeholder: 'Select leave date and time',
                      }}
                      isInvalid={!!touched.leave_date && !!errors.leave_date}
                    />
                    {touched.leave_date && errors.leave_date && (
                      <div className="text-danger">{errors.leave_date}</div>
                    )}
                  </Form.Group>

                  <Button variant="primary" type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Adding...' : 'Add Route'}
                  </Button>
                </Form>
              )}
            </Formik>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default AddCarRoute;
