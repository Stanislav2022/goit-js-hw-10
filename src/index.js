import './css/styles.css';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import debounce from 'lodash.debounce';
const DEBOUNCE_DELAY = 300;

const countryEl = document.querySelector('#search-box');
const listEl = document.querySelector('.country-list');
const countryDivEl = document.querySelector('.country-info');

const fetchCountries = query => {
  return fetch(
    `https://restcountries.com/v2/name/${query}?fields=name,capital,population,flags,languages`
  );
};

countryEl.addEventListener(
  'input',
  debounce(event => {
    if (event.target.value.trim() === '') {
      return;
    }

    fetchCountries(event.target.value.trim())
      .then(response => {
        if (!response.ok) {
          throw new Error(response.status);
        }
        return response.json();
      })
      .then(countries => {
        if (countries.length > 1 && countries.length <= 10) {
          renderCountriesList(countries);
        } else if (countries.length > 10) {
          listEl.innerHTML = '';
          countryDivEl.innerHTML = '';
          Notify.info(
            `Too many matches found. Please enter a more specific name.`
          );
        } else {
          renderCountry(countries[0]);
        }
      })
      .catch(error => {
        listEl.innerHTML = '';
        countryDivEl.innerHTML = '';
        Notify.failure(`Oops! There is no country with that name`);
      });
  }),
  DEBOUNCE_DELAY
);

function renderCountriesList(countries) {
  listEl.innerHTML = '';
  countryDivEl.innerHTML = '';

  const markup = countries
    .map(country => {
      return `<li class="countries-item" >
                <span class="flag-wrapper">
                   <img class="country-item-flag" src="${country.flags.svg}" alt="Flag of the ${country.name}" width="50">
                </span>
                <p class="country-item-name">${country.name}</p>
              </li>`;
    })
    .join('');
  listEl.innerHTML = markup;

  document.querySelectorAll('.countries-item').forEach(element =>
    element.addEventListener('click', event => {
      const substr = event.currentTarget
        .querySelector('p')
        .textContent.split(' ');

      fetchCountries(substr[0])
        .then(countries => {
          if (countries.length > 1 && countries.length < 10) {
            renderCountriesList(countries);
          } else if (countries.length > 10) {
            listEl.innerHTML = '';
            countryDivEl.innerHTML = '';
            Notify.info(
              `There is too many countries found. Please specify the search query!`
            );
          } else {
            renderCountry(countries[0]);
          }
        })
        .catch(error => {
          listEl.innerHTML = '';
          countryDivEl.innerHTML = '';
          Notify.failure(`Oops! There is no country with that name`);
        });
    })
  );
}

function renderCountry(country) {
  listEl.innerHTML = '';
  countryDivEl.innerHTML = '';
  countryDivEl.innerHTML = `<img class="country-item-flag" src="${
    country.flags.svg
  }" alt="Flag of the ${country.name}" width="150">
    <h2 class="country-name">${country.name}</h2>
    <p class="country-capital"><b>Capital:</b> ${country.capital}</p>
    <p class="country-population"><b>Population:</b> ${country.population}</p>
    <p class="country-languages"><b>Languages:</b> ${country.languages
      .map(language => `${language.name}`)
      .join(', ')}</p>`;
}
