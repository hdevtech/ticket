import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { ticket_backend } from 'declarations/ticket_backend';
import { setPaymentCredentials, initiatePayment } from '../../payment/hdev_payment'; // Import payment functions

const BuyTicket = () => {
  const { route_id } = useParams(); // Get route_id from params
  const [route, setRoute] = useState(null);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRouteDetails = async () => {
      try {
        const routeDetails = await ticket_backend.getRouteDetails(Number(route_id));
        console.log('routeDetails:', routeDetails[0]);
        if (routeDetails) {
          setRoute(routeDetails[0]);
        }
      } catch (error) {
        setErrorMessage('Could not fetch route details. Please try again later.' + error);
      } finally {
        setLoading(false);
      }
    };

    const fetchLoggedInUser = () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setLoggedInUser(JSON.parse(storedUser));
      } else {
        setErrorMessage('No logged-in user found. Please log in.');
      }
    };

    fetchRouteDetails();
    fetchLoggedInUser();
  }, [route_id]);

  const handleSubmit = async (values, { setSubmitting }) => {
    if (!loggedInUser) {
      setErrorMessage('You must be logged in to buy a ticket.');
      setSubmitting(false);
      return;
    }

    const date = new Date().toISOString();
    const tx_ref = Math.random().toString(36).substring(2, 14);
    const link = `${window.location.origin}/receipt/${tx_ref}/view`;

    try {
      const set_it = await setPaymentCredentials('HDEV-440a7a6d-bae1-4e32-8e7a-8b13878f594f-ID', 'HDEV-5d49f820-88be-431d-9d1a-031b1acbae7c-KEY');
      // Initiate the payment process
      const paymentResponse = await initiatePayment(values.phone_number, values.amount, tx_ref, link);

      if (paymentResponse.status === 'success') {
        // addTicket(ticket_id: Nat, client_id: Nat, route_id: Nat, amount: Nat, date: Text, first_scan: Text, phone_number: Text, tx_id: Text, tx_ref: Text, payment_status: Text)
        // Save ticket in the backend
        const ticket = {
        }
        await ticket_backend.addTicket(
          Date.now(),
          Number(loggedInUser.id),
          Number(route.route_id),
          Number(route.price),  // Use the route price for the amount
          date,
          'none',
          values.phone_number,
          tx_ref,
          tx_ref,
          'pending' );

        setSuccessMessage('Ticket purchase initiated, waiting for confirmation...');
        setTimeout(() => navigate(`/waiting/${tx_ref}`), 1000); // Redirect to waiting page
      } else {
        setErrorMessage(paymentResponse.message || 'Payment failed.');
      }
    } catch (error) {
      console.error('Ticket purchase error:', error);
      setErrorMessage('Ticket purchase or payment failed. Please try again. ' + error);
    } finally {
      setSubmitting(false);
    }
  };

  const validationSchema = Yup.object().shape({
    phone_number: Yup.string().required('Phone number is required'),
  });

  return (
    <React.Fragment>
      {loading ? (
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : errorMessage ? (
        <Alert variant="danger" className="text-center">{errorMessage}</Alert>
      ) : (
        <>
          <Row>
            <Col>
              <Card className="mb-4">
                <Card.Body>
                  <h5 className="mb-3">{route.from} to {route.destination}</h5>
                  <p>{route.car} - {route.seats} seats available</p>
                  <h4 className="f-w-300 m-b-0">{parseFloat(route.price).toFixed(2)} Frw</h4>
                </Card.Body>
                <Card.Footer>
                  <small>Departure: {route.leave_date}</small>
                </Card.Footer>
              </Card>
            </Col>
          </Row>
          <Row>
            <Col sm={12}>
              <Card>
                <Card.Header>
                  <Card.Title as="h5">Buy Ticket for {route.from} - {route.destination}</Card.Title>
                </Card.Header>
                <Card.Body>
                  {successMessage && <Alert variant="success">{successMessage}</Alert>}
                  {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
                  <Formik
                    initialValues={{ amount: parseInt(route.price), phone_number: '' }}  // Set amount to route price
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                  >
                    {({ values, handleChange, handleSubmit, errors, touched, isSubmitting }) => (
                      <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                          <Form.Label>Amount</Form.Label>
                          <Form.Control
                            type="number"
                            name="amount"
                            value={values.amount}
                            readOnly  // Make the amount field read-only
                          />
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label>Phone Number</Form.Label>
                          <Form.Control
                            type="text"
                            name="phone_number"
                            placeholder="Enter your phone number"
                            value={values.phone_number}
                            onChange={handleChange}
                            isInvalid={!!touched.phone_number && !!errors.phone_number}
                          />
                          {touched.phone_number && errors.phone_number && (
                            <Form.Control.Feedback type="invalid">{errors.phone_number}</Form.Control.Feedback>
                          )}
                        </Form.Group>

                        <Button variant="primary" type="submit" disabled={isSubmitting}>
                          {isSubmitting ? 'Processing...' : 'Buy Ticket'}
                        </Button>
                      </Form>
                    )}
                  </Formik>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </React.Fragment>
  );
};

export default BuyTicket;
