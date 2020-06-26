let app

function init(){
  navigator.serviceWorker && navigator.serviceWorker.register('./sw.js').then(function(registration) {
    registration.addEventListener('updatefound',function(){
      caches.delete('the-magic-cache');
      window.location.reload(true);
    })
    console.log('Excellent, registered with scope: ', registration.scope);
  });

  dba.init();
  app = new Vue({
    el: "#app",
    data: {
      newProjectName: '',
      newTaskName: '',
      newTaskProject: '',
      projects: [],
      tasks: [],
      session: [],
      showClosedTasks: false,
      filterProject: '',
      screen: 'session'
    },
    computed: {
      sessionTaskIds: function(){
        var ids = []
        for(var i=0;i<this.session.length;i++){
          ids.push(this.session[i].id);
        }
        return ids;
      }
    },
    methods: {
      addProject: async function(){
        if(!this.newProjectName){
          return;
        }
        await dba.addProject(this.newProjectName);
        this.newProjectName = '';
        this.projects = await dba.listProjects();
      },
      addTask: async function(){
        console.log(this.newTaskName,this.newTaskProject);
        await dba.addTask(this.newTaskName,this.newTaskProject);
        this.newTaskName = '';
        this.newTaskProject = '';
        await this.getTasks();
      },
      getTasks: async function(){
        this.tasks = await dba.listTasks(this.filterProject,this.showClosedTasks);
      },
      addToSession: function(task){
        if(!this.sessionTaskIds.includes(task.id)){          
          this.session.push(task);
        }
      },
      removeFromSession: function(taskId){
        this.session = this.session.filter(function(value,index,arr){
          return value.id!=taskId
        });
      },
      closeTask: async function(id){
        await dba.closeTask(id);
        await this.getTasks();
      },
      openTask: async function(id){
        await dba.openTask(id);
        await this.getTasks();
      },
      deleteTask: async function(id){
        await dba.deleteTask(id);
        await this.getTasks();
      },
      next: async function(){
        var firstTask = this.session[0];
        this.session.splice(0,1);
        this.session.push(firstTask);
      }
    },
    watch: {
      showClosedTasks: 'getTasks',
      filterProject: 'getTasks'
    },
    mounted: async function(){
      this.projects = await dba.listProjects();
      await this.getTasks();
    }
  })
}


