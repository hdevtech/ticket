import React, { useState, useEffect } from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { Alert, Spinner, Button } from 'react-bootstrap';
import { ticket_backend } from 'declarations/ticket_backend'; // Import the backend
import { getPaymentStatus, setPaymentCredentials } from '../../payment/hdev_payment'; // Import the payment API functions
import Breadcrumb from '../../layouts/AdminLayout/Breadcrumb'; // Import Breadcrumb
import axios from 'axios'; // Import axios for sending the SMS

const WaitingPage = () => {
  const { tx_ref } = useParams(); // Get transaction reference from the URL
  const [status, setStatus] = useState('pending');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [routeDetails, setRouteDetails] = useState(null); // State for route details
  const navigate = useNavigate();

  useEffect(() => {
    const checkPaymentStatus = async () => {
      try {
        const set_it = await setPaymentCredentials('HDEV-440a7a6d-bae1-4e32-8e7a-8b13878f594f-ID', 'HDEV-5d49f820-88be-431d-9d1a-031b1acbae7c-KEY');

        // Fetch payment status using the payment API
        const paymentResponse = await getPaymentStatus(tx_ref);

        // Set payment details from the response
        if (paymentResponse) {
          setPaymentDetails(paymentResponse); // Assuming the response contains payment details

          const paymentStatus = paymentResponse.status; // Adjust based on your actual response structure
          const transactionId = paymentResponse.tx_id;
          const transactionRef = paymentResponse.tx_ref;
          const amount = paymentResponse.amount;
          const customerName = 'Ticket Contributor';
          const customerPhone = paymentResponse.tel;
          // const routeId = paymentResponse.route_id; // Assuming the payment response contains route_id

          // getTicketByTxRef
          const ticket = await ticket_backend.getTicketByTxRef(transactionRef);
          const routeId = ticket[0].route_id;
          console.log('ticket:', ticket);

          // Fetch the route details if not already included in the payment response
          const routeResponse = await ticket_backend.getRouteDetails(routeId);
          setRouteDetails(routeResponse[0]);

          if (paymentStatus === 'success') {
            // Update the ticket payment status in the backend
            const updateStatusResult = await ticket_backend.updateTicketStatus(
              tx_ref, 
              transactionId,
              'success'  // Updating status to "success"
            );
            if (updateStatusResult) {
              setStatus('success');

              // Send confirmation SMS to the contributor
              await sendMessage(customerName, customerPhone, transactionId, amount, tx_ref);

              setTimeout(() => navigate(`/ticket/receipt/${tx_ref}/view`), 2000); // Redirect to receipt
            } else {
              setErrorMessage('Failed to update payment status.');
            }
          } else if (paymentStatus === 'failed') {
            // Update the ticket payment status in the backend
            await ticket_backend.updateTicketStatus(
              tx_ref, 
              transactionId, 
              'failed'  // Updating status to "failed"
            );
            setStatus('failed');
          } else {
            // If payment status is still pending, continue polling
            setTimeout(checkPaymentStatus, 5000); // Polling every 5 seconds
          }
        } else {
          setErrorMessage('Payment response not found.');
        }
      } catch (error) {
        setErrorMessage('Failed to retrieve payment status.' + error);
      } finally {
        setLoading(false);
      }
    };

    checkPaymentStatus();
  }, [tx_ref, navigate]);

  // Function to send SMS to the contributor
  const sendMessage = async (customerName, customerPhone, transactionId, amount, tx_reff) => {
    const formData = new FormData();
    formData.append('sender_id', 'L7-IT');
    formData.append('ref', 'sms');
    formData.append('message', `Dear ${customerName}, your ticket payment has been received. Transaction ID: ${transactionId}, Transaction Reference: ${tx_reff}, Amount: ${amount} Rwf. Thank you!`);
    formData.append('tel', customerPhone);

    try {
      const response = await axios.post(
        'https://sms-api.hdev.rw/v1/api/HDEV-36691687-9144-4e4c-b769-62443d655e15-ID/HDEV-2a1749da-be37-4421-b982-81f10cc53301-KEY',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        }
      );
      console.log('Message sent successfully:', response.data);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <React.Fragment>
      <Breadcrumb />
      <div className="auth-wrapper">
        <div className="auth-content">
          <div className="auth-bg">
            <span className="r" />
            <span className="r s" />
            <span className="r s" />
            <span className="r" />
          </div>
          <Card className="borderless">
            <Row className="align-items-center">
              <Col>
                <Card.Body className="text-center">
                  {loading && <Spinner animation="border" variant="primary" />}
                  
                  {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
                  
                  {status === 'pending' && (
                    <>
                      <h4>Waiting for payment confirmation...</h4>
                      {paymentDetails && (
                        <div className="payment-details">
                          <h5>Payment Details:</h5>
                          <p><strong>Transaction Reference:</strong> {paymentDetails.tx_ref}</p>
                          <p><strong>Amount:</strong> {paymentDetails.amount}</p>
                          <p><strong>Phone Number:</strong> {paymentDetails.tel}</p>
                        </div>
                      )}
                      {routeDetails && (
                        <div className="route-details mt-3">
                          <h5>Route Information:</h5>
                          <p><strong>From:</strong> {routeDetails.from}</p>
                          <p><strong>To:</strong> {routeDetails.destination}</p>
                          <p><strong>Car:</strong> {routeDetails.car}</p>
                          <p><strong>Seats Available:</strong> {routeDetails.seats}</p>
                          <p><strong>Departure Date:</strong> {new Date(routeDetails.leave_date).toString()}</p>
                        </div>
                      )}
                    </>
                  )}
                  
                  {status === 'success' && (
                    <Alert variant="success">Payment successful! Redirecting...</Alert>
                  )}
                  
                  {status === 'failed' && (
                    <Alert variant="danger">
                      Payment failed. 
                      <Button onClick={() => navigate('/client/view-car-routes')} className="ml-2">Try Again</Button>
                    </Alert>
                  )}
                </Card.Body>
              </Col>
            </Row>
          </Card>
        </div>
      </div>
    </React.Fragment>
  );
};

export default WaitingPage;
