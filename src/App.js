import React from 'react';
import './App.css';
import CountUp from 'react-countup';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.lastScrollY = 0;
    this.navbar = React.createRef();  // Reference to the navbar element
    this.hideTimeout = null;
  }

  componentDidMount() {
    window.addEventListener('scroll', this.handleScroll);
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll);
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
    }
  }

  handleScroll = () => {
    const currentScrollY = window.scrollY;

    if (currentScrollY > this.lastScrollY && currentScrollY > 0) {
      // Scrolling down and not at the top of the page, hide the navbar
      this.navbar.current.style.top = '-100px';
    } else {
      // Scrolling up or at the top of the page, show the navbar
      this.navbar.current.style.top = '0';
    }

    // Update lastScrollY to current value
    this.lastScrollY = currentScrollY;

    // Auto-hide after 1 second of no scrolling, only if not at the top
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
    }
    if (currentScrollY > 0) {
      this.hideTimeout = setTimeout(() => {
        if (window.scrollY === this.lastScrollY) {
          this.navbar.current.style.top = '-100px';
        }
      }, 1000);
    }
  };

  handleSubmit = (event) => {
    event.preventDefault();

    const trans_num = document.getElementById('trans_num').value;
    const amt = document.getElementById('amt').value;
    const gender = document.getElementById('gender').value;
    const zip = document.getElementById('zip').value;
    const state = document.getElementById('state').value;
    const city = document.getElementById('city').value;
    const job = document.getElementById('job').value;
    const category = document.getElementById('category').value;
    const merchant = document.getElementById('merchant').value;

    fetch('http://localhost:3000/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      mode: 'cors',
      body: JSON.stringify({ trans_num, amt, gender, zip, state, city, job, category, merchant }),
    })
      .then(response => {
        if (!response.ok) {
          return response.json().then(errorData => {
            throw new Error(errorData.message || 'Unknown error occurred');
          });
        }
        return response.json();
      })
      .then((data) => {
        console.log('Response data:', data);
        if (data.message) {
          alert(data.message);
        } else {
          alert('Has fraud occurred: ' + (data.is_fraud ? 'Yes' : 'No'));
        }
      })
      .catch((error) => {
        console.error('Error:', error);
        alert('An error occurred: ' + error.message);
      });
  };

  render() {
    return (
      <div className='background'>
        <header className="header" ref={this.navbar}>
          <div className="header-container">
            <h1 className="logo">Fraud Detection System</h1>
            <nav className="nav">
              <a href="#home" className='nav-button'>Statistics</a>
              <a href="#fraudcheck" className='nav-button'>Fraud Check</a>
              <a href="#visualization" className='nav-button'>PowerBI Visualization</a>
              <a href="#contact" className='nav-button'>Contact</a>
            </nav>
            <div className="header-actions"></div>
          </div>
        </header>

        <div className='hero-container' id="home">
          <h2 className='hero-heading'>Banking fraud by the numbers</h2>
          <div className='hero-stats'>
            <div className='hero-stat'>
              <CountUp start={0} end={11} duration={0.7} delay={0} suffix='.6%' className='stat-percentage' />
              <p className='stat-description'>
                Identity theft doubled from 6% of fraud in 2019 to <a href="#">11.6% in 2021.</a>
              </p>
            </div>
            <div className='vertical-divider'></div> {/* Divider */}
            <div className='hero-stat'>
              <CountUp start={0} end={6} duration={0.7} delay={0} suffix='.2%' className='stat-percentage' />
              <p className='stat-description'>
                Digital wallet hacking is rising — it increased from 4.4% of fraud in 2019 to <a href="#">6.2% in 2021.</a>
              </p>
            </div>
            <div className='vertical-divider'></div> {/* Divider */}
            <div className='hero-stat'>
              <CountUp start={0} end={17} duration={0.7} delay={0} suffix='.5%' className='stat-percentage' />
              <p className='stat-description'>
                Card details stolen online continues to be a top fraud type, coming in at <a href="#">17.5% in 2021.</a>
              </p>
            </div>
          </div>
        </div>

        <div className='hero-section2' id='fraudcheck'>
          <div className='hero'>
            <p>FRAUD CHECK</p>
            <div className='q'>
                <div className='container'>
                  <form onSubmit={this.handleSubmit}>
                    <div className='input-grid'>
                      <div className='input-wrapper'>
                        <label htmlFor='trans_num'>Transaction Number</label>
                        <input type='text' id='trans_num' name="trans_num" className='underline-input' placeholder='Transaction Number' required pattern='^[a-zA-Z0-9]+$' title='Please enter only numbers.' />
                      </div>
                      <div className='input-wrapper'>
                        <label htmlFor='amt'>Amount</label>
                        <input type='text' id='amt' name='amt' className='underline-input' placeholder='amt' required pattern='^\d{1,3}(,\d{3})*(\.\d+)?$' title='Please enter only numbers.' />
                      </div>
                      <div className='input-wrapper'>
                        <label htmlFor='gender'>Gender</label>
                        <select id='gender' name='gender' className='underline-input'>
                          <option value='male'>Male</option>
                          <option value='female'>Female</option>
                          <option value='other'>Other</option>
                        </select>
                      </div>
                      <div className='input-wrapper'>
                        <label htmlFor='zip_code'>Zip Code</label>
                        <input type='text' id='zip' name='zip' className='underline-input' placeholder='Zip Code' required pattern='\d+' title='Please enter only numbers.' />
                      </div>
                      <div className='input-wrapper'>
                        <label htmlFor='state'>State</label>
                        <input type='text' id='state' name='state' className='underline-input' placeholder='State' required pattern="[A-Za-z\s]+" title="Please enter only letters." />
                      </div>
                      <div className='input-wrapper'>
                        <label htmlFor='city'>City</label>
                        <input type='text' id='city' name='city' className='underline-input' placeholder='City' required pattern="[A-Za-z,-_ ]+" title="Please enter only letters." />
                      </div>
                      <div className='input-wrapper'>
                        <label htmlFor='job'>Job</label>
                        <input type='text' id='job' name='job' className='underline-input' placeholder='Job' required pattern="[A-Za-z,-_ ]+" title="Please enter only letters." />
                      </div>
                      <div className='input-wrapper'>
                        <label htmlFor='category'>Category</label>
                        <input type='text' id='category' name='category' className='underline-input' placeholder='Category' required pattern="[A-Za-z,-_ ]+" title="Please enter only letters." />
                      </div>
                      <div className='input-wrapper'>
                        <label htmlFor='merchant'>Merchant</label>
                        <input type='text' id='merchant' name='merchant' className='underline-input' placeholder='Merchant' required pattern="[A-Za-z,-_ ]+" title="Please enter only letters." />
                      </div>
                    </div>
                    <button type='submit' className='submit-button'>Submit</button>
                  </form>
                </div>
            </div>
          </div>
        </div>
        
        <div className='hero-section3' id='visualization'>
          <div className='hero-container3'>
            <div className='hero'>
              <p>Visualization</p>
              <iframe 
                title="Power BI Report"
                width="100%" 
                height="800px" 
                src="https://app.powerbi.com/view?r=eyJrIjoiODA3ZDRhZmQtOTZlMy00NTEzLTljYTgtODc0MjIzMTllZDkwIiwidCI6IjVmMWFmMDA0LTY2NjEtNDIyNy1iMDEyLTlhZjUyYjc2Nzc2MSJ9" 
                frameBorder="0" 
                allowFullScreen="true">
              </iframe>
            </div>
          </div>
        </div>

        <div className='hero-section4' id='contact'>
          <div className='hero-container4'>
            <div className='hero'>
              <p className='p1'>Contact Us</p>
              <p className='p2'>Email: <a href="mailto:info@dataanalytics.com">info@dataanalytics.com</a></p>
              <p className='p3'>Phone: <a href="tel:+1234567890">+1 234 567 890</a></p>
              <p className='p4'>Address: <a href="https://www.google.com/maps?q=your+address+here" target="_blank" rel="noopener noreferrer">123 Analytics Blvd, Data City</a></p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
