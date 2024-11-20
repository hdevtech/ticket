import React, { useState } from 'react';
import { Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { ticket_backend } from 'declarations/ticket_backend';
import { useNavigate } from 'react-router-dom';

const AddClient = () => {
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate(); 

  // Function to handle client addition
  const handleAddClient = async (values, { setSubmitting }) => {
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const { name, username, password, phone_number } = values;
      const id = Date.now(); // Generate an ID (or use another method if needed)
      await ticket_backend.addClient(id, name, username, password, phone_number); // Add the client
      setSuccessMessage('Client successfully added!');
    } catch (error) {
      setErrorMessage('Failed to add client. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Form validation schema using Yup
  const validationSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    username: Yup.string().required('Username is required'),
    password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
    phone_number: Yup.string().required('Phone number is required'),
  });

  // Function to navigate to the View Clients page
  const handleViewClient = () => {
    navigate('/admin/ViewClients');
  };

  return (
    <Row>
      <Col sm={12}>
        <Button variant="primary" onClick={handleViewClient} className="mb-3">
            View Clients
          </Button>
        <Card>
          <Card.Header>
            <Card.Title as="h5">Add Client</Card.Title>
          </Card.Header>
          <Card.Body>
            {successMessage && <Alert variant="success">{successMessage}</Alert>}
            {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}

            <Formik
              initialValues={{ name: '', username: '', password: '', phone_number: '' }}
              validationSchema={validationSchema}
              onSubmit={handleAddClient}
            >
              {({ values, handleChange, handleSubmit, errors, touched, isSubmitting }) => (
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      placeholder="Enter name"
                      value={values.name}
                      onChange={handleChange}
                      isInvalid={!!touched.name && !!errors.name}
                    />
                    {touched.name && errors.name && (
                      <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
                    )}
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Username</Form.Label>
                    <Form.Control
                      type="text"
                      name="username"
                      placeholder="Enter username"
                      value={values.username}
                      onChange={handleChange}
                      isInvalid={!!touched.username && !!errors.username}
                    />
                    {touched.username && errors.username && (
                      <Form.Control.Feedback type="invalid">{errors.username}</Form.Control.Feedback>
                    )}
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                      type="password"
                      name="password"
                      placeholder="Enter password"
                      value={values.password}
                      onChange={handleChange}
                      isInvalid={!!touched.password && !!errors.password}
                    />
                    {touched.password && errors.password && (
                      <Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>
                    )}
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Phone Number</Form.Label>
                    <Form.Control
                      type="text"
                      name="phone_number"
                      placeholder="Enter phone number"
                      value={values.phone_number}
                      onChange={handleChange}
                      isInvalid={!!touched.phone_number && !!errors.phone_number}
                    />
                    {touched.phone_number && errors.phone_number && (
                      <Form.Control.Feedback type="invalid">{errors.phone_number}</Form.Control.Feedback>
                    )}
                  </Form.Group>

                  <Button variant="primary" type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Adding...' : 'Add Client'}
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

export default AddClient;
