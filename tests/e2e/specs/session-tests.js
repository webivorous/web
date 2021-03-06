describe("Session activity", () => {
  before(function() {
    cy.fixture("users/student1").as("student");
    cy.fixture("users/volunteer1").as("volunteer");
    cy.fixture("users/volunteer2").as("volunteer2");
  });

  describe("Student-only algebra session activity", () => {
    before(function() {
      cy.login(this.student);
      cy.endAllSessions();
    });

    beforeEach(function() {
      cy.login(this.student);
    });

    it("Should start an algebra session", function() {
      cy.visit("/dashboard");

      cy.get(".SubjectCard:nth-of-type(1) .LargeButton-primary")
        .should("be.visible")
        .click();

      cy.get(".SubjectSelectionModal-subtopic:nth-of-type(1)")
        .should("be.visible")
        .click();

      cy.get(".ModalTemplate-form .LargeButton-primary")
        .should("be.visible")
        .click();

      cy.location("pathname").should("eq", "/session/math/algebra");
      cy.wait(7000);

      const SESSION_URL_PATTERN = /^\/session\/math\/algebra\/\w{24}$/;
      cy.location("pathname").should("match", SESSION_URL_PATTERN);
    });

    it("Should send a chat message", function() {
      const STUDENT_ALGEBRA_MSG = "Hi, I have an algebra question.";

      cy.get(".message-box .messages")
        .find(".message")
        .should("have.length", 0);

      cy.get(".chat .message-textarea")
        .type(STUDENT_ALGEBRA_MSG)
        .type("{enter}");

      cy.get(".message-box .messages")
        .find(".message")
        .should("have.length", 1);

      cy.get(".message-box .messages .message .contents span").should(
        "have.text",
        STUDENT_ALGEBRA_MSG
      );
    });

    it("Should cancel the session", function() {
      cy.get(".end-session button")
        .should("contain.text", "Cancel")
        .click();

      cy.location("pathname").should("eq", "/dashboard");
      cy.get(".RejoinSessionHeader").should("not.exist");
    });
  });

  describe("Student and volunteer essay session activity", function() {
    const ESSAYS_SESSION_URL_PATTERN = /^\/session\/college\/essays\/\w{24}$/;
    const STUDENT_ESSAY_MSG = "Hi, I have an essay question.";
    const VOLUNTEER_ESSAY_MSG = "Hello! What's your essay question?";

    before(function() {
      cy.login(this.student);
      cy.endAllSessions();
      cy.logout();

      cy.login(this.volunteer);
      cy.endAllSessions();
      cy.logout();
    });

    it("Should start an essay session", function() {
      cy.login(this.student);
      cy.visit("/dashboard");

      cy.get(".SubjectCard:nth-of-type(2) .LargeButton-primary")
        .should("be.visible")
        .click();

      cy.get(".SubjectSelectionModal-subtopic:nth-of-type(2)")
        .should("be.visible")
        .click();

      cy.get(".ModalTemplate-form .LargeButton-primary")
        .should("be.visible")
        .click();

      cy.location("pathname").should("eq", "/session/college/essays");
      cy.wait(7000);

      cy.location("pathname").should("match", ESSAYS_SESSION_URL_PATTERN);
      cy.wait(4000);

      cy.get(".chat .message-textarea")
        .type(STUDENT_ESSAY_MSG)
        .type("{enter}");
    });

    it("Should return to dashboard during active session", function() {
      cy.login(this.student);

      cy.get(".session-header__dashboard-link").click();
      cy.wait(8000);

      cy.location("pathname").should("eq", "/dashboard");
      cy.get(".RejoinSessionHeader").should("exist");
    });

    it("Should switch to volunteer account and see student help request on dashboard", function() {
      cy.login(this.volunteer);
      cy.visit("/dashboard");
      cy.wait(5000);

      cy.get(".session-list tbody tr:nth-of-type(1) td:nth-of-type(1)").should(
        "contain.text",
        "Student"
      );

      cy.get(".session-list tbody tr:nth-of-type(1) td:nth-of-type(2)").should(
        "contain.text",
        "Essays"
      );
    });

    it("Should join the student essay session", function() {
      cy.login(this.volunteer);

      cy.get(".session-list tbody tr:nth-of-type(1)")
        .should("be.visible")
        .click();

      cy.location("pathname").should("match", ESSAYS_SESSION_URL_PATTERN);

      cy.wait(5000);

      cy.get(
        ".message-box .messages .message:nth-of-type(1) .contents span"
      ).should("have.text", STUDENT_ESSAY_MSG);
    });

    it("Should send a chat response to the student", function() {
      cy.login(this.volunteer);

      cy.get(".message-box .messages")
        .find(".message")
        .should("have.length", 1);

      cy.get(".chat .message-textarea")
        .type(VOLUNTEER_ESSAY_MSG)
        .type("{enter}");

      cy.get(
        ".message-box .messages .message:nth-of-type(2) .contents span"
      ).should("have.text", VOLUNTEER_ESSAY_MSG);
    });

    it("Should end the essay session and direct volunteer to feedback form", function() {
      cy.login(this.volunteer);

      cy.get(".end-session button")
        .should("contain.text", "End session")
        .click();

      const VOLUNTEER_FEEDBACK_URL_PATTERN = /^\/feedback\/\w{24}\/college\/essays\/volunteer\/\w{24}\/\w{24}$/;
      cy.location("pathname").should("match", VOLUNTEER_FEEDBACK_URL_PATTERN);
    });

    it("Should submit volunteer feedback form", function() {
      cy.get(".vue-star-rating-pointer")
        .eq(2)
        .click();

      cy.get(".radio-question-selection-cell")
        .eq(4)
        .click();

      cy.get(".radio-question-selection-cell")
        .eq(6)
        .click();

      cy.get(".radio-question-selection-cell")
        .eq(13)
        .click();

      cy.get(".radio-question-selection-cell")
        .eq(18)
        .click();

      cy.get(".radio-question-selection-cell")
        .eq(22)
        .click();

      cy.get(".text-question-textarea").type(
        "Hey, the review materials were great! They helped me prepare for my tutoring session."
      );

      cy.get(".submit-button").click();

      cy.location("pathname").should("eq", "/dashboard");
    });

    it("Should visit Student feedback form and submit feedback", function() {
      const CALCULUS_SESSION_URL_PATTERN = /^\/session\/math\/calculus\/\w{24}$/;
      const STUDENT_FEEDBACK_URL_PATTERN = /^\/feedback\/\w{24}\/math\/calculus\/student\/\w{24}\/\w{24}$/;

      cy.login(this.student);

      cy.get(".SubjectCard:nth-of-type(1) .LargeButton-primary")
        .should("be.visible")
        .click();

      cy.get(".SubjectSelectionModal-subtopic:nth-of-type(2)")
        .should("be.visible")
        .click();

      cy.get(".ModalTemplate-form .LargeButton-primary")
        .should("be.visible")
        .click();

      cy.wait(6000);
      cy.location("pathname").should("match", CALCULUS_SESSION_URL_PATTERN);

      cy.login(this.volunteer);
      cy.visit("/dashboard");
      cy.wait(5000);
      cy.get(".session-list tbody tr:nth-of-type(1)")
        .should("be.visible")
        .click();

      cy.location("pathname").should("match", CALCULUS_SESSION_URL_PATTERN);

      cy.wait(5000);
      cy.login(this.student);
      cy.visit("/dashboard");
      cy.get(".LargeButton-primary--reverse").click();
      cy.get(".end-session button")
        .should("contain.text", "End session")
        .click();

      cy.wait(5000);
      cy.location("pathname").should("match", STUDENT_FEEDBACK_URL_PATTERN);

      cy.get(".vue-star-rating-pointer")
        .eq(2)
        .click();

      cy.get(".radio-list__option")
        .eq(3)
        .click();

      cy.get(".radio-question-selection-cell")
        .eq(4)
        .click();

      cy.get(".radio-question-selection-cell")
        .eq(6)
        .click();

      cy.get(".radio-question-selection-cell")
        .eq(13)
        .click();

      cy.get(".text-question-textarea").type(
        "It was lit, very cool, nice 100."
      );

      cy.get(".submit-button").click();

      cy.location("pathname").should("eq", "/dashboard");
    });
  });

  describe("Student and volunteer revisiting a session that has ended", () => {
    const CALCULUS_SESSION_URL_PATTERN = /^\/session\/math\/calculus\/\w{24}$/;

    beforeEach(function() {
      cy.login(this.student);
      cy.visit("/dashboard");
    });

    afterEach(function() {
      // Have a student end their own session
      cy.login(this.student);
      cy.endAllSessions();
    });

    it("Should see 'Session Canceled' when a student visits a canceled session", function() {
      cy.wait(3000);
      cy.get(".SubjectCard:nth-of-type(1) .LargeButton-primary")
        .should("be.visible")
        .click();

      cy.get(".SubjectSelectionModal-subtopic:nth-of-type(2)")
        .should("be.visible")
        .click();

      cy.get(".ModalTemplate-form .LargeButton-primary")
        .should("be.visible")
        .click();

      cy.wait(10000);
      cy.location("pathname")
        .should("match", CALCULUS_SESSION_URL_PATTERN)
        .then(() => cy.url())
        .then(url => cy.getSessionId(url).as("sessionId"))
        .then(() => {
          cy.url().should("contain", this.sessionId);
          cy.wait(6000);
          cy.get(".end-session button")
            .should("contain.text", "Cancel" || "End session")
            .click();
          cy.wait(6000);
        })
        .then(() => {
          cy.location("pathname").should("eq", "/dashboard");
          cy.visit(`/session/math/calculus/${this.sessionId}`);
          cy.wait(9000);
          return cy.get(".SessionFulfilledModal").children();
        })
        .then(modalElement => {
          const modalTitle = modalElement[0];
          const modalMessage = modalElement[1];
          expect(modalTitle).to.have.text("Session Canceled");
          expect(modalMessage).to.have.text("You have canceled your request.");
          return cy.get(".LargeButton-primary").click();
        })
        .then(() => {
          cy.location("pathname").should("eq", "/dashboard");
        });
    });

    it("Should see 'Session Canceled' when a volunteer visits a canceled session", function() {
      cy.get(".SubjectCard:nth-of-type(1) .LargeButton-primary")
        .should("be.visible")
        .click();

      cy.get(".SubjectSelectionModal-subtopic:nth-of-type(2)")
        .should("be.visible")
        .click();

      cy.get(".ModalTemplate-form .LargeButton-primary")
        .should("be.visible")
        .click();

      cy.wait(10000);
      cy.location("pathname")
        .should("match", CALCULUS_SESSION_URL_PATTERN)
        .then(() => cy.url())
        .then(url => cy.getSessionId(url).as("sessionId"))
        .then(() => {
          cy.url().should("contain", this.sessionId);
          cy.wait(6000);
          cy.get(".end-session button")
            .should("contain.text", "Cancel")
            .click();
          cy.wait(6000);
        })
        .then(() => {
          cy.location("pathname").should("eq", "/dashboard");
          cy.login(this.volunteer);
          cy.visit(`/session/math/calculus/${this.sessionId}`);
          cy.wait(9000);
          return cy.get(".SessionFulfilledModal").children();
        })
        .then(modalElement => {
          const modalTitle = modalElement[0];
          const modalMessage = modalElement[1];
          expect(modalTitle).to.have.text("Session Canceled");
          expect(modalMessage).to.have.text(
            "The student has canceled their request. Thanks for trying, we really appreciate it!"
          );
          return cy.get(".LargeButton-primary").click();
        })
        .then(() => {
          cy.location("pathname").should("eq", "/dashboard");
        });
    });

    it("Should see 'Session Fulfilled' when another volunteer visits an active fulfilled session", function() {
      cy.get(".SubjectCard:nth-of-type(1) .LargeButton-primary")
        .should("be.visible")
        .click();

      cy.get(".SubjectSelectionModal-subtopic:nth-of-type(2)")
        .should("be.visible")
        .click();

      cy.get(".ModalTemplate-form .LargeButton-primary")
        .should("be.visible")
        .click();

      cy.wait(10000);
      cy.location("pathname")
        .should("match", CALCULUS_SESSION_URL_PATTERN)
        .then(() => cy.url())
        .then(url => cy.getSessionId(url).as("sessionId"))
        .then(() => {
          cy.url().should("contain", this.sessionId);
          cy.wait(6000);
          cy.login(this.volunteer);
          cy.visit(`/session/math/calculus/${this.sessionId}`);
          cy.wait(9000);
        })
        .then(() => {
          cy.login(this.volunteer2);
          cy.visit(`/session/math/calculus/${this.sessionId}`);
          cy.wait(9000);
          return cy.get(".SessionFulfilledModal").children();
        })
        .then(modalElement => {
          const modalTitle = modalElement[0];
          const modalMessage = modalElement[1];
          expect(modalTitle).to.have.text("Session Fulfilled");
          expect(modalMessage).to.have.text(
            "Another volunteer has already joined this session. Thanks for trying, we really appreciate it!"
          );
          return cy.get(".LargeButton-primary").click();
        })
        .then(() => {
          cy.location("pathname").should("eq", "/dashboard");
          cy.logout();
        });
    });

    it("Should see 'Session Fulfilled' when a volunteer vists a previous fulfilled session", function() {
      cy.get(".SubjectCard:nth-of-type(1) .LargeButton-primary")
        .should("be.visible")
        .click();

      cy.get(".SubjectSelectionModal-subtopic:nth-of-type(2)")
        .should("be.visible")
        .click();

      cy.get(".ModalTemplate-form .LargeButton-primary")
        .should("be.visible")
        .click();

      cy.wait(10000);
      cy.location("pathname")
        .should("match", CALCULUS_SESSION_URL_PATTERN)
        .then(() => cy.url())
        .then(url => cy.getSessionId(url).as("sessionId"))
        .then(() => {
          cy.url().should("contain", this.sessionId);
          cy.wait(6000);
          cy.login(this.volunteer);
          cy.visit(`/session/math/calculus/${this.sessionId}`);
          cy.wait(9000);
          cy.get(".end-session button")
            .should("contain.text", "End session")
            .click();
        })
        .then(() => {
          cy.visit(`/session/math/calculus/${this.sessionId}`);
          cy.wait(9000);
          return cy.get(".SessionFulfilledModal").children();
        })
        .then(modalElement => {
          const modalTitle = modalElement[0];
          const modalMessage = modalElement[1];
          expect(modalTitle).to.have.text("Session Fulfilled");
          expect(modalMessage).to.have.text(
            "This session has already finished."
          );
          return cy.get(".LargeButton-primary").click();
        })
        .then(() => {
          cy.location("pathname").should("eq", "/dashboard");
        });
    });

    it("Should see 'Session Fulfilled' when a student vists a previous fulfilled session", function() {
      cy.get(".SubjectCard:nth-of-type(1) .LargeButton-primary")
        .should("be.visible")
        .click();

      cy.get(".SubjectSelectionModal-subtopic:nth-of-type(2)")
        .should("be.visible")
        .click();

      cy.get(".ModalTemplate-form .LargeButton-primary")
        .should("be.visible")
        .click();

      cy.wait(10000);
      cy.location("pathname")
        .should("match", CALCULUS_SESSION_URL_PATTERN)
        .then(() => cy.url())
        .then(url => cy.getSessionId(url).as("sessionId"))
        .then(() => {
          cy.url().should("contain", this.sessionId);
          cy.wait(6000);
          cy.login(this.volunteer);
          cy.visit(`/session/math/calculus/${this.sessionId}`);
          cy.wait(6000);
          cy.login(this.student);
          cy.visit(`/session/math/calculus/${this.sessionId}`);
          cy.wait(9000);
          return cy
            .get(".end-session button")
            .should("contain.text", "End session")
            .click();
        })
        .then(() => {
          cy.wait(8000);
          cy.visit(`/session/math/calculus/${this.sessionId}`);
          cy.wait(9000);
          return cy.get(".SessionFulfilledModal").children();
        })
        .then(modalElement => {
          const modalTitle = modalElement[0];
          const modalMessage = modalElement[1];
          expect(modalTitle).to.have.text("Session Fulfilled");
          expect(modalMessage).to.have.text(
            "This session has already finished."
          );
          return cy.get(".LargeButton-primary").click();
        })
        .then(() => {
          cy.location("pathname").should("eq", "/dashboard");
        });
    });
  });
});
