import { Component, ElementRef } from '@angular/core';
// import { Channel } from 'src/app/interfaces/channel';
import { Channel } from 'src/app/models/channel';
import { User } from 'src/app/models/user';
import { ChannelService } from 'src/app/shared/services/channel.service';
import { ClickOutsideService } from 'src/app/shared/services/click-outside-directive.service';
import { ResponsiveService } from 'src/app/shared/services/responsive.service';
import { SearchInputService } from 'src/app/shared/services/search-input.service';
import { UserService } from 'src/app/shared/services/user.service';
import { WorkspaceService } from 'src/app/shared/services/workspace.service';

@Component({
  selector: 'app-channel',
  templateUrl: './channel.component.html',
  styleUrls: ['./channel.component.scss'],
})
export class ChannelComponent {
  clickedChannelId!: string;
  clickedChannel!: Channel;
  additionalMembers: User[] = [];
  previousAdded: boolean = false;

  infoVisible: boolean = false;
  editNameButton: boolean = true;
  editDescriptionButton: boolean = true;

  constructor(
    public ws: WorkspaceService,
    public cs: ChannelService,
    public sis: SearchInputService,
    public us: UserService,
    public rs: ResponsiveService,
    public cos: ClickOutsideService,
    private elementRef: ElementRef
  ) {}

  ngOnInit(): void {
    this.cs.clickedChannelId.subscribe((chId: string) => {
      this.clickedChannelId = chId;
    });

    this.cs.clickedChannel.subscribe((ch: Channel) => {
      this.clickedChannel = ch;
    });

    this.cos.onClickOutside(this.elementRef, () => {
      this.ws.closeAddMembers();
    });
  }

  showInfo() {
    this.infoVisible = !this.infoVisible;
    this.editNameButton = true;
    this.editDescriptionButton = true;
  }

  /**
   * Schaltet die Sichtbarkeit des Hinzufügens von Mitgliedern im bestehenden Kanal um.
   * Schließt die Dropdown-Liste, wenn das Fenster zum Hinzufügen von Mitgliedern geschlossen wird.
   */
  switchShowAddMembersInExistingChannel() {
    this.ws.showAddMembersInExistingChannel =
      !this.ws.showAddMembersInExistingChannel;
    // Dropdown-Liste soll immer geschlossen werden, wenn Leute hinzufügen Fenster geschlossen wird
    if (!this.ws.showAddMembersInExistingChannel) {
      this.ws.showAddMembers = false;
    }
  }

  /**
   * Schaltet zwischen der Bearbeitung des Kanalnamens und der Anzeige des Namens um.
   */
  changeNameToInput() {
    this.editNameButton = !this.editNameButton;
  }

  /**
   * Schaltet zwischen der Bearbeitung der Kanalbeschreibung und der Anzeige der Beschreibung um.
   */
  changeDescriptionToInput() {
    this.editDescriptionButton = !this.editDescriptionButton;
  }

  /**
   * Entfernt ein Mitglied aus der Liste der zusätzlichen Mitglieder.
   *
   * @param email - Die E-Mail-Adresse des zu entfernenden Mitglieds.
   */
  removeMember(email: string) {
    const members = this.additionalMembers;
    if (members) {
      for (let index = 0; index < members.length; index++) {
        const member = members[index];
        if (member.email == email) {
          members.splice(index, 1);
        }
      }
    }
    this.additionalMembers = [];
    this.ws.inputMember = '';
  }

  /**
   * Fügt vorherige Mitglieder dem Kanal hinzu.
   * Diese Funktion wird nur einmal pro Fenster-Aufruf aufgerufen.
   */
  addPreviousMembers() {
    // additionalMembers nimmt die zusätzlichen Members auf und fügt die bisherigen Members (einmal) hinzu
    if (!this.previousAdded) {
      this.previousAdded = true;
      this.clickedChannel.members.forEach((member) => {
        this.additionalMembers.push(member);
      });
    }
    this.previousAdded = false;
  }

  /**
   * Gibt eine Vorschau der Anzahl der Mitglieder zurück.
   *
   * @remarks
   * Diese Funktion gibt entweder die Anzahl der Mitglieder oder die Anzahl der restlichen Mitglieder zurück,
   * je nachdem, ob die Anzahl der Mitglieder kleiner als 5 ist.
   *
   * @returns Eine Zeichenkette, die die Vorschau der Anzahl der Mitglieder darstellt.
   */
  previewNumberMembers(): string {
    let numberMembers = this.clickedChannel.members.length;
    if (numberMembers < 5) {
      return numberMembers.toString();
    } else {
      return '+' + (numberMembers - 4).toString();
    }
  }

  /**
   * Speichert den geänderten Kanalnamen.
   *
   * @remarks
   * Diese Funktion aktualisiert den Kanalnamen über den ChannelService und schaltet
   * anschließend die Bearbeitung des Namens aus.
   */
  saveName() {
    this.cs.updateChannel(
      { name: this.clickedChannel.name },
      this.clickedChannel
    );
    this.changeNameToInput();
  }

  /**
   * Speichert die geänderte Kanalbeschreibung.
   *
   * @remarks
   * Diese Funktion aktualisiert die Kanalbeschreibung über den ChannelService und schaltet
   * anschließend die Bearbeitung der Beschreibung aus.
   */
  saveDescription() {
    this.cs.updateChannel(
      { description: this.clickedChannel.description },
      this.clickedChannel
    );
    this.changeDescriptionToInput();
  }

  /**
   * Fügt ein Mitglied zum Kanal hinzu.
   *
   * @remarks
   * Diese Funktion aktualisiert die Mitgliederliste des Kanals über den ChannelService
   * unter Verwendung der bereinigten JSON-Daten der zusätzlichen Mitglieder.
   * Anschließend wird das Fenster zum Hinzufügen von Mitgliedern geschlossen und die
   * Liste der zusätzlichen Mitglieder wird zurückgesetzt.
   */
  addAMember() {
    this.cs.updateChannel(
      { members: this.cs.getCleanMemberJson(this.additionalMembers) },
      this.clickedChannel
    );
    this.switchShowAddMembersInExistingChannel();
    this.additionalMembers = [];
  }
}
