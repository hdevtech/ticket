import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Row, Col, Card, Table, Button } from 'react-bootstrap';
import { ticket_backend } from 'declarations/ticket_backend'; // Import the backend
import Breadcrumb from '../../layouts/AdminLayout/Breadcrumb'; // Import Breadcrumb

const TicketReceiptPage = () => {
  const { tx_ref } = useParams(); // Get transaction reference from the URL
  const [ticket, setTicket] = useState(null);
  const [route, setRoute] = useState(null);
  const [client, setClient] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchTicketDetails = async () => {
      try {
        // Fetch all tickets and routes from the backend
        const tickets = await ticket_backend.getAllTickets();
        const routes = await ticket_backend.getRoutes();
        const clients = await ticket_backend.getClients();

        // Find the ticket by tx_ref
        const foundTicket = tickets.find(t => t.tx_ref === tx_ref);

        if (foundTicket) {
          setTicket(foundTicket);

          // Find the associated route
          const foundRoute = routes.find(r => r.route_id === foundTicket.route_id);
          setRoute(foundRoute);

          // Find the associated client
          const foundClient = clients.find(c => c.id === foundTicket.client_id);
          setClient(foundClient);
        } else {
          setErrorMessage('Ticket not found.');
        }
      } catch (error) {
        setErrorMessage('Failed to retrieve ticket details.');
      }
    };

    fetchTicketDetails();
  }, [tx_ref]);

  const handlePrint = () => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Ticket Receipt</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h3, h5 { text-align: center; }
            .receipt { width: 80%; margin: auto; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
              .receipt { width: 100%; }
            }
          </style>
        </head>
        <body>
          <div class="receipt">
            <h3>Ticket Receipt</h3>
            ${errorMessage ? `<p class="text-danger">${errorMessage}</p>` : ''}
            ${ticket ? `
              <table>
                <tr>
                  <th>Transaction Reference</th>
                  <td>${ticket.tx_ref}</td>
                </tr>
                <tr>
                  <th>Amount</th>
                  <td>${parseFloat(ticket.amount).toFixed(2)} Frw</td>
                </tr>
                <tr>
                  <th>Phone Number</th>
                  <td>${ticket.phone_number}</td>
                </tr>
                <tr>
                  <th>Payment Status</th>
                  <td>${ticket.payment_status}</td>
                </tr>
                <tr>
                  <th>Date</th>
                  <td>${new Date(ticket.date).toLocaleString()}</td>
                </tr>
              </table>
              ${route ? `
                <h5>Route Details</h5>
                <table>
                  <tr>
                    <th>From</th>
                    <td>${route.from}</td>
                  </tr>
                  <tr>
                    <th>To</th>
                    <td>${route.destination}</td>
                  </tr>
                  <tr>
                    <th>Car</th>
                    <td>${route.car}</td>
                  </tr>
                  <tr>
                    <th>Seats Available</th>
                    <td>${route.seats}</td>
                  </tr>
                  <tr>
                    <th>Departure Date</th>
                    <td>${new Date(route.leave_date).toString()}</td>
                  </tr>
                </table>
              ` : ''}
              ${client ? `
                <h5>Client Details</h5>
                <table>
                  <tr>
                    <th>Client Name</th>
                    <td>${client.name}</td>
                  </tr>
                  <tr>
                    <th>Client Phone Number</th>
                    <td>${client.phone_number}</td>
                  </tr>
                </table>
              ` : ''}
              <h5>Thank you for your purchase!</h5>
            ` : ''}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
    printWindow.close();
  };

  return (
    <React.Fragment>
      <Breadcrumb />
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <Card.Title as="h5">Ticket Receipt</Card.Title>
              <span className="d-block m-t-5">Details of your ticket purchase.</span>
            </Card.Header>
            <Card.Body>
              {errorMessage && <p className="text-danger">{errorMessage}</p>}
              {ticket && (
                <div>
                  <Table responsive hover striped>
                    <tbody>
                      <tr>
                        <th>Transaction Reference</th>
                        <td>{ticket.tx_ref}</td>
                      </tr>
                      <tr>
                        <th>Amount</th>
                        <td>{parseFloat(ticket.amount).toFixed(2)} Frw</td>
                      </tr>
                      <tr>
                        <th>Phone Number</th>
                        <td>{ticket.phone_number}</td>
                      </tr>
                      <tr>
                        <th>Payment Status</th>
                        <td>{ticket.payment_status}</td>
                      </tr>
                      <tr>
                        <th>Date</th>
                        <td>{new Date(ticket.date).toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </Table>

                  {route && (
                    <div>
                      <h5>Route Details</h5>
                      <Table responsive hover striped>
                        <tbody>
                          <tr>
                            <th>From</th>
                            <td>{route.from}</td>
                          </tr>
                          <tr>
                            <th>To</th>
                            <td>{route.destination}</td>
                          </tr>
                          <tr>
                            <th>Car</th>
                            <td>{route.car}</td>
                          </tr>
                          <tr>
                            <th>Seats Available</th>
                            <td>{route.seats}</td>
                          </tr>
                          <tr>
                            <th>Departure Date</th>
                            <td>{new Date(route.leave_date).toString()}</td>
                          </tr>
                        </tbody>
                      </Table>
                    </div>
                  )}

                  {client && (
                    <div>
                      <h5>Client Details</h5>
                      <Table responsive hover striped>
                        <tbody>
                          <tr>
                            <th>Client Name</th>
                            <td>{client.name}</td>
                          </tr>
                          <tr>
                            <th>Client Phone Number</th>
                            <td>{client.phone_number}</td>
                          </tr>
                        </tbody>
                      </Table>
                    </div>
                  )}
                </div>
              )}
              <Button variant="primary" onClick={handlePrint}>Print Ticket Receipt</Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default TicketReceiptPage;
