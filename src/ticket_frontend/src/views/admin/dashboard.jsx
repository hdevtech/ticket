import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Spinner, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { ticket_backend } from 'declarations/ticket_backend'; // Backend import

const DashDefault = () => {
  const [dashboardData, setDashboardData] = useState({
    usersCount: 0, // Clients
    routesCount: 0, // Routes
    totalRevenue: 0, // From tickets
    recentUsers: [],
    recentRoutes: [],
    recentTickets: [],
    adminInfo: null, // Admin information
  });
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const storedAdmin = localStorage.getItem('user');
        const admin = JSON.parse(storedAdmin);

        if (!admin) {
          setErrorMessage('No logged-in admin found. Please log in.');
          setLoading(false);
          return;
        }

        // Fetch admin information
        const adminInfo = await ticket_backend.getAdminById(Number(admin.id));

        // Fetch users/clients
        const users = await ticket_backend.getClients();

        // Fetch routes
        const routes = await ticket_backend.getRoutes();

        // Fetch tickets
        const tickets = await ticket_backend.getAllTickets();

        // Map route ID to route details
        const routeMap = {};
        routes.forEach(route => {
          routeMap[route.route_id] = {
            from: route.from,
            destination: route.destination,
            car: route.car,
            price: route.price,
            seats: route.seats,
            leave_date: route.leave_date,
          };
        });

        // Filter data for recent entries
        const recentUsers = users.slice(-3);
        const recentRoutes = routes.slice(-3);
        const recentTickets = tickets
          .filter(ticket => ticket.payment_status === 'success')
          .slice(-3)
          .map(ticket => ({
            ...ticket,
            routeDetails: routeMap[ticket.route_id], // Add route details to the ticket
          }));

        // Count users and routes
        const usersCount = users.length;
        const routesCount = routes.length;

        // Calculate total revenue from successful tickets
        const totalRevenue = tickets
          .filter(ticket => ticket.payment_status === 'success')
          .reduce((sum, ticket) => sum + BigInt(ticket.amount), BigInt(0));

        // Update state with fetched data
        setDashboardData({
          usersCount,
          routesCount,
          totalRevenue: totalRevenue.toString(),
          recentUsers,
          recentRoutes,
          recentTickets,
          adminInfo: adminInfo ? adminInfo[0] : null,
        });
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        setErrorMessage('Failed to fetch data.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleCardClick = (link) => {
    navigate(link);
  };

  const dashSalesData = [
    { title: 'Users/Clients', linkClick: '/admin/ViewUsers', amount: dashboardData.usersCount, icon: 'icon-arrow-up text-c-green', value: dashboardData.usersCount, class: 'progress-c-theme' },
    { title: 'Routes', linkClick: '/admin/ViewRoutes', amount: dashboardData.routesCount, icon: 'icon-arrow-up text-c-green', value: dashboardData.routesCount, class: 'progress-c-theme2' },
    { title: 'Revenue', linkClick: '/admin/ViewTickets', amount: `${dashboardData.totalRevenue} Frw`, icon: 'icon-arrow-up text-c-green', value: `${dashboardData.totalRevenue} Frw`, class: 'progress-c-theme' }
  ];

  if (loading) {
    return <Spinner animation="border" variant="primary" />;
  }

  if (errorMessage) {
    return <Alert variant="danger">{errorMessage}</Alert>;
  }

  return (
    <React.Fragment>
      {/* Admin Info Card */}
      {dashboardData.adminInfo && (
        <Row className="mb-4">
          <Col>
            <Card>
              <Card.Body>
                <h5>Admin Info</h5>
                <p><strong>Name:</strong> {dashboardData.adminInfo.name}</p>
                <p><strong>Username:</strong> {dashboardData.adminInfo.username}</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Dashboard Overview Cards */}
      <Row>
        {dashSalesData.map((data, index) => (
          <Col key={index} xl={6} xxl={4}>
            <Card onClick={() => handleCardClick(data.linkClick)}>
              <Card.Body>
                <h6 className="mb-4">{data.title}</h6>
                <div className="row d-flex align-items-center">
                  <div className="col-9">
                    <h3 className="f-w-300 d-flex align-items-center m-b-0">
                      <i className={`feather ${data.icon} f-30 m-r-5`} /> {data.amount}
                    </h3>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Recent Routes */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header>
              <Card.Title as="h5">Recent Routes</Card.Title>
            </Card.Header>
            <Card.Body>
              <Table responsive hover striped>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>From</th>
                    <th>Destination</th>
                    <th>Car</th>
                    <th>Price</th>
                    <th>Seats</th>
                    <th>Leave Date</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.recentRoutes.length > 0 ? (
                    dashboardData.recentRoutes.map((route, index) => (
                      <tr key={route.route_id}>
                        <td>{index + 1}</td>
                        <td>{route.from}</td>
                        <td>{route.destination}</td>
                        <td>{route.car}</td>
                        <td>{parseFloat(route.price)} Frw</td>
                        <td>{parseInt(route.seats)}</td>
                        <td>{route.leave_date}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center">No recent routes found.</td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Tickets */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header>
              <Card.Title as="h5">Recent Tickets</Card.Title>
            </Card.Header>
            <Card.Body>
              <Table responsive hover striped>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Route</th>
                    <th>Client</th>
                    <th>Phone Number</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.recentTickets.length > 0 ? (
                    dashboardData.recentTickets.map((ticket, index) => (
                      <tr key={ticket.ticket_id}>
                        <td>{index + 1}</td>
                        <td>{`${ticket.routeDetails.from} - ${ticket.routeDetails.destination}`}</td>
                        <td>{ticket.client_id}</td>
                        <td>{ticket.phone_number}</td>
                        <td>{parseFloat(ticket.amount)} Frw</td>
                        <td>{new Date(ticket.date).toLocaleDateString()}</td>
                        <td>{ticket.payment_status}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center">No recent tickets found.</td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default DashDefault;
