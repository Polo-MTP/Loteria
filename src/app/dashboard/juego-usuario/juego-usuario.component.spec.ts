import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JuegoUsuarioComponent } from './juego-usuario.component';

describe('JuegoUsuarioComponent', () => {
  let component: JuegoUsuarioComponent;
  let fixture: ComponentFixture<JuegoUsuarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JuegoUsuarioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JuegoUsuarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
