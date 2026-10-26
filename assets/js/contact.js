(function () {
  'use strict';

  const form = document.getElementById('contact-form');
  const subjectSelect = document.getElementById('subject');
  const subjectFieldGroups = form.querySelectorAll('[data-subject-fields]');

  function updateSubjectFields() {
    subjectFieldGroups.forEach(group => {
      const isActive = group.dataset.subjectFields === subjectSelect.value;
      group.hidden = !isActive;
      group.disabled = !isActive;
    });
  }

  subjectSelect.addEventListener('change', updateSubjectFields);
  updateSubjectFields();

  form.addEventListener('submit', async event => {
    event.preventDefault();

    const submitButton = document.getElementById('submit-btn');
    const status = document.getElementById('form-status');
    const honeypot = form.querySelector('[name="_gotcha"]').value;

    if (honeypot) {
      status.innerHTML = '<p class="text-primary">Thanks for your message! I\'ll be in touch soon.</p>';
      status.style.display = 'block';
      form.reset();
      updateSubjectFields();
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = 'Sending...';
    status.style.display = 'none';

    const activeGroup = form.querySelector('[data-subject-fields]:not([hidden])');
    const detailFields = activeGroup
      ? Array.from(activeGroup.elements).filter(field => field.name && field.value)
      : [];
    const detailLines = detailFields.map(field => {
      const label = activeGroup.querySelector(`label[for="${field.id}"]`);
      const labelText = label
        ? label.textContent.replace(' *', '').replace(/[?:]$/, '')
        : field.name;
      return `${labelText}: ${field.value}`;
    });
    const message = form.querySelector('[name="message"]').value;
    const subjectLabel = subjectSelect.options[subjectSelect.selectedIndex].text;
    const data = new FormData(form);

    data.set('subject', subjectLabel);
    data.set('_subject', `Website contact: ${subjectLabel}`);
    data.set(
      'message',
      detailLines.length
        ? `${detailLines.join('\n')}\n\nMessage:\n${message}`
        : message
    );

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: data
      });

      if (!response.ok) {
        throw new Error(`Formspree returned ${response.status}`);
      }

      status.innerHTML = '<p class="text-primary">Thanks for your message! I\'ll be in touch soon.</p>';
      form.reset();
      updateSubjectFields();
    } catch (error) {
      console.error('Unable to submit contact form:', error);
      status.innerHTML = '<p style="color: red;">Sorry, there was an error sending your message. Please try again or reach out via social media.</p>';
    }

    status.style.display = 'block';
    submitButton.disabled = false;
    submitButton.textContent = 'Send Message';
  });
})();
