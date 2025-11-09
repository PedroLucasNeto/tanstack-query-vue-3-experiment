describe('UI End-to-End Tests', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should display the main title', () => {
    cy.get('h1').should('exist')
  })

  it('should list items when "Listar" button is clicked', () => {
    cy.contains('button', 'Listar').click()
    cy.get('ul li').its('length').should('be.greaterThan', 0)
  })

  it('should show item details when an item is clicked', () => {
    cy.contains('button', 'Listar').click()
    cy.get('ul li a').first().then(($a) => {
      const itemId = $a.text()
      cy.wrap($a).click()
      cy.contains('Detalhe').should('exist')
      cy.contains(itemId).should('exist')
    })
  })

  it('should allow mutation of an item', () => {
    cy.contains('button', 'Listar').click()
    cy.get('ul li a').first().click()
    const newName = 'Updated Item Name'
    cy.get('input[placeholder="Novo nome"]').type(newName)
    cy.contains('button', 'Salvar').click()
    cy.contains('Detalhe').should('contain.text', newName)
  })

  it('should clear output when "Limpar" button is clicked', () => {
    cy.contains('button', 'Listar').click()
    cy.contains('button', 'Limpar').click()
    cy.get('ul li').should('have.length', 0)
  })

  context('Measure scenarios', () => {
    // Helper: run a scenario and wait for completion (simple polling)
    function runScenario(name: string) {
      cy.get('select').first().select(name) // scenario select
      cy.get('select').eq(1).select('20') // runs select
      cy.contains('button', 'Start').click()
      // wait until not running (progress equals runs)
      cy.contains(/Executando/).should('exist')
      cy.wait(500) // initial wait
      cy.get('div').contains(/Executando/).should('not.exist')
    }

    it('Scenario A should record 21 entries for R20', () => {
      runScenario('A')
      cy.get('h3').should('contain.text', 'Resultados')
      cy.get('ul li').should('have.length', 21)
      // durations should be >= 100ms (backend latency 150ms)
      cy.get('ul li').first().invoke('text').then(txt => {
        const num = parseFloat(txt.split('—')[1])
        expect(num).to.be.greaterThan(100)
      })
    })

    it('Scenario B should record 21 entries for R20', () => {
      runScenario('B')
      cy.get('ul li').should('have.length', 21)
    })

    it('Scenario C should record at least 1 network entry (the list) for R20', () => {
      runScenario('C')
      cy.get('ul li').its('length').should('be.gte', 1)
      // first entry should be a network duration (~150ms)
      cy.get('ul li').first().invoke('text').then(txt => {
        const num = parseFloat(txt.split('—')[1])
        expect(num).to.be.greaterThan(100)
      })
    })
  })
})
